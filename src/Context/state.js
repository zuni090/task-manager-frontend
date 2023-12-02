
import { useState, createContext, useContext } from 'react';


const SharedStateContext = createContext();

export const SharedStateProvider = ({ children }) => {

  const [tasks, setTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  const [deadline, setDeadline] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDetail, setTaskDetail] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <SharedStateContext.Provider value={{ tasks, setTasks , inProgressTasks, setInProgressTasks , completedTasks, setCompletedTasks ,
      deadline, setDeadline , taskName, setTaskName , selectedTask, setSelectedTask , taskDetail, setTaskDetail
    }}>
      {children}
    </SharedStateContext.Provider>
  );
};

export const useSharedState = () => {
  return useContext(SharedStateContext);
};