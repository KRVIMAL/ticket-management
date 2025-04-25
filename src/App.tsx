import { useState } from 'react';
import { TicketTable } from './tickets/components/TicketTable';
import { TicketForm } from './tickets/components/TicketModal';
import { ticketInsertField } from './helpers/ticket-helper';
import { createTicket, updateTicket } from './tickets/services/ticket.service';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [formField, setFormField] = useState(ticketInsertField());
  const [isEditing, setIsEditing] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState(null);

  const handleCreateClick = () => {
    setFormField(ticketInsertField());
    setIsEditing(false);
    setCurrentTicketId(null);
    setShowForm(true);
  };

  const handleEditClick = (ticket:any) => {
    const normalizedTicket = {
      ...ticket,
      user: typeof ticket.userId === 'object' ? ticket.userId : null,
    };

    setFormField(ticketInsertField(normalizedTicket));
    setIsEditing(true);
    setCurrentTicketId(ticket._id || null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleSubmitTicket = async (newTicket:any) => {
    try {
      if (isEditing && currentTicketId) {
        await updateTicket(currentTicketId, newTicket);
        toast.success('Ticket updated successfully');
      } else {
        await createTicket(newTicket);
        toast.success('Ticket created successfully');
      }
      setShowForm(false);
    } catch (error:any) {
      toast.error(error.message || 'Failed to save ticket');
    }
  };

  return (
    <div className="container mx-auto p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <Toaster position="top-center" />
      
      {showForm ? (
        <TicketForm 
          setFormField={setFormField} 
          formField={formField} 
          addTicketHandler={handleSubmitTicket} 
          edit={isEditing}
          onCancel={handleCancel}
        />
      ) : (
        <TicketTable 
          onCreateClick={handleCreateClick} 
          onEditClick={handleEditClick} 
        />
      )}
    </div>
  );
}

export default App;