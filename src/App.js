import React, { useState, useEffect } from 'react';
import './App.css';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CheckboxMarkedCircleOutlineIcon from 'mdi-react/CheckboxMarkedCircleOutlineIcon';
import CheckboxMarkedCircleIcon from 'mdi-react/CheckboxMarkedCircleIcon';
import ProgressCheckIcon from 'mdi-react/ProgressCheckIcon';
import DeleteForeverIcon from 'mdi-react/DeleteForeverIcon';
import PlusIcon from 'mdi-react/PlusIcon';

import initColumns from './initColumns';
import KanbieLogo from './assets/kanbie-logo.svg';
import uuid from 'uuid';
import OutsideClickHandler from 'react-outside-click-handler';

const maxItems = 5;

function App() {
  const [columns, setColumns] = useState();
  const [isInput, setInput] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const getColumns = localStorage.getItem("columns");

    if(!getColumns) {
      setColumns(initColumns);
    } else {
      setColumns(JSON.parse(getColumns));
    }

    setLoaded(true);
  }, []);

  const saveColumns = (columns) => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if(!destination) return;

    //Delete
    if(destination.droppableId === "trash") {
      const sourceItems = columns.filter((column => column.title === source.droppableId))[0].items;
      sourceItems.splice(source.index, 1);
    } else {
      //Different column
      if(source.droppableId !== destination.droppableId) {
        const sourceItems = columns.filter((column => column.title === source.droppableId))[0].items;
        const destItems = columns.filter((column => column.title === destination.droppableId))[0].items;
        if(destItems.length >= maxItems) return;
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removed);
      } else {
        //Same column
        const sourceItems = columns.filter((column => column.title === source.droppableId))[0].items;
        const [removed] = sourceItems.splice(source.index, 1);
        sourceItems.splice(destination.index, 0, removed);
      }
    }

    saveColumns(columns);
  }

  const renderInputBox = () => (
    <OutsideClickHandler onOutsideClick={() => {setInput(false)}}>
      <textarea 
        placeholder="New task..."
        autoFocus
        onKeyDown={(e) => onAddCard(e)}
        onChange={e => setInputText(e.target.value)}
        className="input-add"
        maxLength={100}
      />
    </OutsideClickHandler>
  )

  const handleClickAdd = () => {
    setInput(true);

  }

  const onAddCard = (e) => {
    if(e.key === "Enter" && inputText !== "") {
      columns[0].items.push({
        id: uuid(),
        content: inputText
      });

      setInput(false);
    }

    return;
  }

  return (
    <div>
      <div className="header-container">
        <img alt="logo" src={KanbieLogo} width={28} className="kanbie-logo"/>
        <div className="header">
          kanbie
        </div>
      </div>
      {!!loaded && 
      <div className="main-container">
        <DragDropContext
          onDragEnd={onDragEnd}
        >
          {columns.map(column => (
            <div>
              <div className="column-header-container">
                <div className="column-heading">{column.title}</div>
                {column.title === "To-do" ? 
                  <CheckboxMarkedCircleOutlineIcon size={24} color="#fff" style={{marginBottom: "8px"}}/>
                  : (column.title === "Doing" ?
                  <ProgressCheckIcon size={24} color="#fff" style={{marginBottom: "8px"}}/>
                  : 
                  <CheckboxMarkedCircleIcon size={24} color="#fff" style={{marginBottom: "8px"}}/>
                  )
                }
              </div>
              <Droppable droppableId={column.title}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      background: snapshot.isDraggingOver ? "#400033" : "#121212",
                      minHeight: "400px",
                      paddingTop: "50px",
                      marginTop: "-62px"
                    }}
                    className="droppable-container"
                  > 
                    
                    {column.items.map((item, i) => (
                      <Draggable key={item.id} draggableId={item.content + item.id} index={i}>
                        {(provided, snapshot) => (
                          <div 
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            style={{
                              userSelect: 'none',
                              backgroundColor: snapshot.isDragging ? "#272727" : "#1a1a1a",
                              ...provided.draggableProps.style
                            }}
                            className="draggable-card"
                          >
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
          <Droppable droppableId="trash">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver ? "#6e0000" : "#3d0000",
                  width: "20px",
                  position: "absolute",
                  top: 0,
                  right: 0,
                  margin: "12px"
                }}
                className="droppable-container"
              > 
                <DeleteForeverIcon color="#fff" className="delete-icon"/>
              </div>
            )}  
          </Droppable>
        </DragDropContext>
        <div 
          className="add-button-container droppable-container"
          onClick={() => handleClickAdd()}
        >
          <PlusIcon color="#fff" className="add-icon"/>
          {!!isInput && renderInputBox()}
        </div>
      </div>
      }
    </div>
  );
}

export default App;
