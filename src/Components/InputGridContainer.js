import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import axios from 'axios';
import { useSharedState } from '../Context/state';

import Swal from 'sweetalert2'

const RECCURENCE_PATTERN = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

const TASK_TYPES = {
  SIMPLE: 'Simple Task',
  RECURRING: 'Recurring Task',
};

const InputGridContainer = (props) => {


  const { setTasks, setInProgressTasks , deadline, setDeadline , taskName, setTaskName , taskDetail, setTaskDetail} = useSharedState();

  const defaultTaskType = props.defaultTaskType;
  const initialTaskPattern = props.initialPattern;

  const [taskType, setTaskType] = useState(defaultTaskType);
  const [recurrencePattern, setRecurrencePattern] = useState(initialTaskPattern);
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  const handleTaskTypeChange = (event) => {
    setTaskType(event.target.value);
  };

  const handleRecurrencePatternChange = (event) => {
    setRecurrencePattern(event.target.value);
  };

  const handleRecurrenceIntervalChange = (event) => {
    setRecurrenceInterval(event.target.value);
  };

  const handleAddTask = async () => {
    const newTask = {
      taskId: new Date().getTime(),
      name: taskName,
      type: 'inProgress',
      deadline,
      detail: taskDetail,
      recurrencePattern: taskType === 'recurring' ? recurrencePattern : undefined,
      recurrenceInterval: taskType === 'recurring' ? recurrenceInterval : undefined,
    };
  
    let currentDate = new Date();
  
    if (new Date(deadline) < currentDate) {
      console.error('Deadline cannot be less than the current date.');
      Swal.fire("Error", "Deadline cannot be less than the current date.", "error");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/task', newTask);
      console.log(response.data); // Log the response from the server
  
      setTasks((prev) => [...prev, newTask]);
      setInProgressTasks((prev) => [...prev, newTask]);
  
      if (taskType === 'recurring') {
        const intervalInMilliseconds = recurrenceInterval * 24 * 60 * 60 * 1000;
  
        while (currentDate < new Date(deadline)) {
          const recurrenceTask = {
            taskId: new Date().getTime(),
            name: taskName,
            detail: taskDetail,
            type: 'inProgress',
            deadline: currentDate.toISOString().slice(0, -8),
          };
  
          if (currentDate >= new Date()) {
            setTasks((prev) => [...prev, recurrenceTask]);
            setInProgressTasks((prev) => [...prev, recurrenceTask]);
          }
  
          switch (recurrencePattern.toLowerCase()) {
            case RECCURENCE_PATTERN.DAILY:
              currentDate.setTime(currentDate.getTime() + intervalInMilliseconds);
              break;
  
            case RECCURENCE_PATTERN.WEEKLY:
              currentDate.setDate(currentDate.getDate() + recurrenceInterval * 7);
              break;
  
            case RECCURENCE_PATTERN.MONTHLY:
              currentDate.setMonth(currentDate.getMonth() + recurrenceInterval);
              break;
  
            default:
              console.error('Invalid recurring pattern. Supported patterns: daily, weekly, monthly');
              Swal.fire("Error", "Invalid recurring pattern. Supported patterns: daily, weekly, monthly", "error");
              return;
          }
        }
      }
  
      if (taskName !== '' && taskDetail !== '') {
        Swal.fire("Task Added!", "", "success");
      }
  
      // Reset form fields
      setTaskName('');
      setTaskDetail('');
      setTaskType(defaultTaskType);
      setDeadline('');
      setRecurrencePattern(initialTaskPattern);
      setRecurrenceInterval(1);
  
    } catch (error) {
      console.error('Error adding task:', error.message);
      Swal.fire("Error", "Error adding task!", "error");
    }
  };
  
  
  return (
    <>
        <Grid item xs={6} >
            <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px' }}>
              <Typography variant="h5" style={{ marginBottom: '20px' }}>
                {props.heading}
              </Typography>

                <form>
                    <TextField
                        label="Task Name"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                    />

                    <TextField
                        label="Task Details"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        value={taskDetail}
                        onChange={(e) => setTaskDetail(e.target.value)}
                    />


                    <FormControl fullWidth variant="outlined" margin="normal">
                        <InputLabel id="task-type-label">Task Type</InputLabel>
                        <Select
                        labelId="task-type-label"
                        id="task-type"
                        value={taskType}
                        onChange={handleTaskTypeChange}
                        label="Task Type"
                        >
                        <MenuItem value="simple">{TASK_TYPES.SIMPLE}</MenuItem>
                        <MenuItem value="recurring">{TASK_TYPES.RECURRING}</MenuItem>
                        </Select>
                    </FormControl>
                    {taskType === 'recurring' && (
                        <div>
                        <FormControl fullWidth variant="outlined" margin="normal">
                            <InputLabel id="recurrence-pattern-label">Recurrence Pattern</InputLabel>
                            <Select
                            labelId="recurrence-pattern-label"
                            id="recurrence-pattern"
                            value={recurrencePattern}
                            onChange={handleRecurrencePatternChange}
                            label="Recurrence Pattern"
                            >
                            <MenuItem value="daily">{RECCURENCE_PATTERN.DAILY}</MenuItem>
                            <MenuItem value="weekly">{RECCURENCE_PATTERN.WEEKLY}</MenuItem>
                            <MenuItem value="monthly">{RECCURENCE_PATTERN.MONTHLY}</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Recurrence Interval"
                            type="number"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            value={recurrenceInterval}
                            onChange={handleRecurrenceIntervalChange}
                        />
                        </div>
                    )}
                    <TextField
                        label="Deadline"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                        shrink: true,
                        }}
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                    <Button variant="contained" color="success" onClick={handleAddTask} style={{ marginTop: '10px' }}>
                        Add Task
                    </Button>
                </form>
            </Paper>
          </Grid >
      
    </>
  )
}

export default InputGridContainer;
