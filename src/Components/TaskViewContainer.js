import React, { useState , useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import List from '@mui/material/List'; 
import ListItem from '@mui/material/ListItem'; 


import RecurringTaskInstancesList from './RecurringTaskInstancesList';
import { useSharedState } from '../Context/state';

import { GrView } from "react-icons/gr";
import { FaEdit } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";

import axios from 'axios';
import Swal from 'sweetalert2'

const TASK_STATUS = {
    INPROGRESS : 'In Progress',
    COMPLETED: 'Completed',
}

const TaskViewContainer = (props) => {
    const {tasks , setTasks , inProgressTasks , setInProgressTasks  , completedTasks, setCompletedTasks , selectedTask, setSelectedTask } = useSharedState();

    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
      const fetchTasks = async () => {
        try {
          const response = await axios.get('https://breakable-lime-cygnet.cyclic.app/api/task/getAll');
          const allTasks = response.data;
          setTasks(allTasks);
    
          const inProgress = allTasks.filter(task => task.type === 'inProgress');
          const completed = allTasks.filter(task => task.type === 'completed');
    
          setInProgressTasks(inProgress);
          setCompletedTasks(completed);
    
          console.log(allTasks);
        } catch (error) {
          console.error('Error fetching tasks:', error.message);
        }
      };
    
      fetchTasks();
    }, []);
    


    const updateTaskStatus = () => {
        const now = new Date().toISOString().slice(0, -8);
        const overdueTasks = inProgressTasks.filter((task) => task.deadline < now);
        if (overdueTasks.length > 0) {
          setInProgressTasks((prev) => prev.filter((task) => !overdueTasks.includes(task)));
        }
    };

    useEffect(() => {
        const taskStatusUpdater = setInterval(updateTaskStatus, 60000);
        return () => clearInterval(taskStatusUpdater);
    }, [updateTaskStatus , inProgressTasks]);


    const calculateRecurrenceDates = (task) => {
        const recurrenceDates = [];
        let currentDate = new Date(task.deadline);
      
        for (let i = 0; i < task.recurrenceInterval; i++) {
          const instanceId = `${task.id}-${i + 1}`; 
          recurrenceDates.push({
            id: instanceId,
            name: task.name,
            deadline: new Date(currentDate).toISOString().slice(0, -8),
            recurrencePattern: task.recurrencePattern,
            recurrenceInterval: task.recurrenceInterval,
          });
      
          switch (task.recurrencePattern) {
            case 'daily':
              currentDate.setDate(currentDate.getDate() + 1);
              break;
            case 'weekly':
              currentDate.setDate(currentDate.getDate() + 7);
              break;
            case 'monthly':
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
            default:
              break;
          }
        }
      
        return recurrenceDates;
    };
    
    const handleDeleteTask = async (taskId) => {
      try {
        // Show a confirmation dialog with Swal
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'You won\'t be able to revert this!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        });
    
        if (result.isConfirmed) {
          // User confirmed the deletion
          console.log("del >> ", taskId);
    
          // Call the API to delete the task by taskId
          await axios.delete('https://breakable-lime-cygnet.cyclic.app/api/task/delete', { data: { taskId } });
    
          // Update the local state after successful deletion
          setTasks((prev) => prev.filter((task) => task.taskId !== taskId));
          setInProgressTasks((prev) => prev.filter((task) => task.taskId !== taskId));
          setCompletedTasks((prev) => prev.filter((task) => task.taskId !== taskId));
    
          // Show a success message with Swal
          Swal.fire({
            title: 'Deleted!',
            text: 'Your task has been deleted.',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('Error deleting task:', error.message);
    
        // Show an error message with Swal
        Swal.fire("Error", "Error deleting task", "error");
      }
    };
    
    
    
    const handleUpdateTask = () => {
      const updatedTaskName = document.getElementById('updatedTaskName').value;
      const updatedTaskDeadline = document.getElementById('updatedTaskDeadline').value;
    
      // Update the selected task within the TaskView component state
      setSelectedTask((prev) => ({
        ...prev,
        name: updatedTaskName,
        deadline: updatedTaskDeadline,
      }));
    
      // Update the task in the taskList view immediately
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id
            ? { ...task, name: updatedTaskName, deadline: updatedTaskDeadline }
            : task
        )
      );
    
      // Close the update modal
      setUpdateModalOpen(false);
    };
    
    const filterTasks = () => {
        const now = new Date().toISOString().slice(0, -8);
      
        switch (filter) {
          case 'inProgress':
            return inProgressTasks
              .map((task) => {
                if (task.type === 'recurring') {
                  const recurrenceDates = calculateRecurrenceDates(task);
                  const nextInstances = recurrenceDates.filter((date) => date >= now);
                  return nextInstances.map((date, index) => ({
                    ...task,
                    deadline: date,
                    frequencyIndicator: index === 0 ? 'Next Occurrence' : `+${index} Recurrence`,
                  }));
                } else {
                  return task.deadline >= now ? [task] : [];
                }
              })
              .flat();
      
          case 'completed':
            return completedTasks;
      
          case 'all':
            return tasks
              .map((task) => {
                if (task.type === 'recurring') {
                  const recurrenceDates = calculateRecurrenceDates(task);
                  const nextInstance = recurrenceDates.find((date) => date >= now);
                  return nextInstance ? { ...task, deadline: nextInstance, frequencyIndicator: 'Next Occurrence' } : null;
                } else {
                  return task.deadline >= now ? task : null;
                }
              })
              .filter(Boolean);
        }
    };
    
    
    const handleMarkAsDone = async (taskId) => {
      console.log("hdone >> ", taskId);
    
      try {
        const taskToMove = inProgressTasks.find((task) => task.taskId === taskId);
    
        if (!taskToMove) {
          console.error('Task not found in inProgressTasks:', taskId);
          return;
        }

        const tid = taskToMove.taskId;
    
        console.log('tid >>', tid);
    
        const response = await axios.put('https://breakable-lime-cygnet.cyclic.app/api/task/updateStatus', { taskId: tid });
        console.log('Response from server:', response.data);

        if (taskToMove.type === 'recurring') {
          const recurringInstances = tasks.filter(
            (task) => task.type === 'recurring' && task.name === taskToMove.name
          );
    
          const completedInstance = recurringInstances.find((task) => task.taskId === taskId);
          setCompletedTasks((prev) => [...prev, { ...completedInstance, type: 'completed' }]);

          setInProgressTasks((prev) => prev.filter((task) => task.taskId !== taskId));
        } else {
          setCompletedTasks((prev) => [...prev, { ...taskToMove, type: 'completed' }]);
          setInProgressTasks((prev) => prev.filter((task) => task.taskId !== taskId));
        }
    
        Swal.fire('Task Completed!');
      } catch (error) {
        console.error('Error marking task as completed:', error.message);
        Swal.fire('Error', 'Error marking task as completed', 'error');
      }
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    useEffect(() => {
        if (selectedTask) {
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.taskId === selectedTask.taskId ? { ...selectedTask } : task
            )
          );
        }
    }, [selectedTask, setTasks]);
    

      

  return (
    <>
      <Grid item xs={6} style={{ maxHeight: '500px' }}>
        <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px' }}>
          <Typography variant="h5" style={{ marginBottom: '20px' }}>
            {props.heading}
          </Typography>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="filter-label">Filter</InputLabel>
            <Select
              labelId="filter-label"
              id="filter"
              value={filter}
              onChange={handleFilterChange}
              label="Filter"
            >
              <MenuItem value="all">ALL</MenuItem>
              <MenuItem value="inProgress">{TASK_STATUS.INPROGRESS}</MenuItem>
              <MenuItem value="completed">{TASK_STATUS.COMPLETED}</MenuItem>
            </Select>
          </FormControl>
          <Grid style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <List>
            {filterTasks().length > 0 ? (
              filterTasks().map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem alignItems="flex-start">
                    <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px', width: '100%' }}>
                      <Typography variant="h6">{task && task.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{task && task.detail}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Deadline: </strong> {task && task.deadline}
                      </Typography>
                      {task.type === 'recurring' && (
                        <RecurringTaskInstancesList instances={calculateRecurrenceDates(task)} />
                      )}
                      <Divider style={{ margin: '10px 0' }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                          variant="subtitle2"
                          style={{
                            fontWeight: 'bold',
                            color: task.type === 'inProgress' ? 'green' : task.type === 'completed' ? 'green' : 'error',
                          }}
                        >
                          {task.type === 'inProgress' ? 'In Progress' : 'Completed'}
                        </Typography>
                        {task.type === 'inProgress' && (
                          <span>
                            {/* <Button color="success" onClick={() => setUpdateModalOpen(true)}>
                              <FaEdit />
                            </Button> */}
                            <Button color="warning" onClick={() => handleDeleteTask(task.taskId)}>
                              <FiX />
                            </Button>
                            <Button color="success" onClick={() => handleMarkAsDone(task.taskId)}>
                              <FiCheck />
                            </Button>
                          </span>
                        )}
                      </div>
                    </Paper>
                  </ListItem>
                  {index < filterTasks().length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Typography variant="body2">Nothing to display here.</Typography>
            )}

            </List>
          </Grid>
        </Paper>
      </Grid>  


      {/* Update Task Modal */}
      <Modal
          open={isUpdateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={isUpdateModalOpen}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', maxWidth: '400px', margin: 'auto' }}>
              <Typography variant="h5" style={{ marginBottom: '20px', textAlign: 'center' }}>
                Update Task
              </Typography>
              {selectedTask && (
                <div>
                  
                  <TextField
                    id="updatedTaskName"
                    label="Updated Task Name"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    defaultValue={selectedTask.name}
                    onChange={(e) =>
                      setSelectedTask((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <TextField
                    id="updatedTaskDeadline"
                    label="Updated Deadline"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    type="datetime-local"
                    defaultValue={selectedTask.deadline}
                    onChange={(e) =>
                      setSelectedTask((prev) => ({ ...prev, deadline: e.target.value }))
                    }
                  />
                  {/* Add more fields based on your task object */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ flex: '1', marginRight: '10px' }}
                      onClick={handleUpdateTask}
                    >
                      Update Task
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      style={{ flex: '1' }}
                      onClick={() => setUpdateModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Fade>
        </Modal>

    </>
  )
}

export default TaskViewContainer;
