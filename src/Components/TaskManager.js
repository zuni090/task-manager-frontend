import React , {useEffect }  from 'react';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Header from './Heading';
import InputGridContainer from './InputGridContainer';
import TaskViewContainer from './TaskViewContainer';

import { useSharedState } from '../Context/state';
import axios from 'axios';

const TaskManager = () => {

  const {tasks, setTasks} = useSharedState();

  return (
    <>
      <Header title="Task Manager" />

      <Container maxWidth="md" style={{ marginTop: '20px' }}>

        <Grid container spacing={3} style={{ height: '500px'}}>
            <InputGridContainer heading="Add Task" defaultTaskType="simple" initialPattern="daily"  />
            <TaskViewContainer heading="Task List" />
        </Grid>

      </Container>
    </>
  );
};

export default TaskManager;