import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';  // Add this import
import ListItem from '@mui/material/ListItem';  // Add this import

const RecurringTaskInstancesList = ({ instances }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    return (
      <div>
        <Button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Hide Instances' : 'Show Instances'}
        </Button>
        {isExpanded && (
          <List style={{ marginLeft: '20px' }}>
            {instances.map((instance) => (
              <ListItem key={instance.id} alignItems="flex-start">
                <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px', width: '100%' }}>
                  <Typography variant="h6">{instance.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{instance.detail}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Deadline: </strong> {instance.deadline}
                  </Typography>
                </Paper>
              </ListItem>
            ))}
          </List>
        )}
      </div>
    );
  };

export default RecurringTaskInstancesList;