/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import type {
  Ticket,
  TicketFormFields,
  TicketMessage,
  TicketStatus,
  TicketType,
  User,
} from '../../types/ticket';
import {
  ticketTypeOptions,
  ticketStatusOptions,
  generateTicketId,
} from '../../helpers/ticket-helper';
import { searchUsers } from '../services/ticket.service';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface TicketFormProps {
  setFormField: (formField: TicketFormFields) => void;
  formField: TicketFormFields;
  addTicketHandler: (ticket: Ticket) => void;
  edit: boolean;
  onCancel: () => void;
}

export const TicketForm = ({
  setFormField,
  formField,
  addTicketHandler,
  edit,
  onCancel,
}: TicketFormProps) => {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(
    null
  );
  const [messageError, setMessageError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    _id: string;
    fullName: string;
  } | null>(null);

  useEffect(() => {
    try {
      const imzClientData = localStorage.getItem('imzClient');
      if (imzClientData) {
        const parsedData = JSON.parse(imzClientData);
        if (parsedData.userData) {
          setCurrentUser({
            _id: parsedData.userData._id,
            fullName: parsedData.userData.fullName,
          });
        }
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await searchUsers(1, 10, {});
        if (response.success && response.data) {
          setUsers(response.data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setIsLoading(false);
      }
    };

    if (!edit) {
      fetchUsers();
    }
  }, [edit]);

  useEffect(() => {
    if (edit && formField.messages) {
      setMessages(formField.messages);
    } else {
      setMessages([]);
    }
  }, [edit, formField.messages]);

  const resetForm = () => {
    setFormField({
      ticketId: { value: '', error: '' },
      ticketType: { value: '', error: '' },
      user: { value: null, error: '' },
      userEmail: { value: '', error: '' },
      ticketStatus: { value: '', error: '' },
      messages: [],
      newMessage: { value: '', error: '' },
    });
    setMessages([]);
    setNewMessage('');
    setEditingMessageIndex(null);
    setMessageError('');
    setGeneralError('');
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleOnChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormField({
      ...formField,
      [name]: {
        ...formField[name as keyof TicketFormFields],
        value: value,
        error: '',
      },
    });
  };

  const handleUserSelect = (user: User) => {
    setFormField({
      ...formField,
      user: {
        value: user,
        error: '',
      },
      userEmail: {
        value: user.email,
        error: '',
      },
    });
  };

  const validateMessageFields = (): boolean => {
    let isValid = true;
    setMessageError('');

    if (!newMessage.trim()) {
      setMessageError('Message is required');
      isValid = false;
    }

    if (!currentUser) {
      toast.error('User information not found. Please log in again.');
      isValid = false;
    }

    return isValid;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newFormField = { ...formField };
    setGeneralError('');

    if (!formField.ticketType.value) {
      newFormField.ticketType.error = 'Ticket type is required';
      isValid = false;
    }

    if (!formField.user.value) {
      newFormField.user.error = 'User is required';
      isValid = false;
    }

    if (messages.length === 0) {
      setGeneralError('At least one message must be added to create a ticket');
      isValid = false;
    }

    setFormField(newFormField);
    return isValid;
  };

  const handleAddMessage = () => {
    if (validateMessageFields() && currentUser) {
      if (editingMessageIndex !== null) {
        const updatedMessages = [...messages];
        updatedMessages[editingMessageIndex] = {
          ...updatedMessages[editingMessageIndex],
          comments: newMessage,
        };
        setMessages(updatedMessages);
        setEditingMessageIndex(null);
      } else {
        setMessages([
          ...messages,
          {
            comments: newMessage,
            commentBy: currentUser.fullName,
          },
        ]);
      }
      setNewMessage('');
      setMessageError('');
      setGeneralError('');
    }
  };

  const handleEditMessage = (index: number) => {
    const messageToEdit = messages[index];
    setNewMessage(messageToEdit.comments);
    setEditingMessageIndex(index);
    setMessageError('');
  };

  const handleRemoveMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
    if (editingMessageIndex === index) {
      setEditingMessageIndex(null);
      setNewMessage('');
      setMessageError('');
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const ticketId = edit ? formField.ticketId.value : generateTicketId();
    const userId = formField.user.value?._id || '';

    const newTicket: Ticket = {
      ticketId,
      ticketType: formField.ticketType.value as TicketType,
      userId: userId,
      messages: messages,
      ticketStatus: formField.ticketStatus.value as TicketStatus,
    };

    addTicketHandler(newTicket);
    resetForm();
  };

  return (
    <div
      className="container mx-auto p-4"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <h1
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          fontSize: '18px',
          marginBottom: '24px',
        }}
      >
        {edit ? 'Update Ticket' : 'Create Ticket'}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Row 1: Ticket Type and Status */}
        <div>
          <label
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '100%',
              color: '#2B2B2B',
              marginBottom: '8px',
              display: 'block',
            }}
          >
            Ticket Type *
          </label>
          <select
            name="ticketType"
            value={formField?.ticketType?.value}
            onChange={handleOnChange}
            style={{
              width: '100%',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid #C2C2C2',
              padding: '0 12px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: formField?.ticketType?.value ? '#000000' : '#8E8E8E',
            }}
            className={formField?.ticketType?.error ? 'border-red-500' : ''}
          >
            <option value="">Select ticket type</option>
            {ticketTypeOptions?.map((option: any) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
          {formField?.ticketType?.error && (
            <p className="mt-1 text-xs text-red-500">
              {formField?.ticketType.error}
            </p>
          )}
        </div>

        <div>
          <label
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '100%',
              color: '#2B2B2B',
              marginBottom: '8px',
              display: 'block',
            }}
          >
            Status *
          </label>
          <select
            name="ticketStatus"
            value={formField?.ticketStatus?.value}
            onChange={handleOnChange}
            style={{
              width: '100%',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid #C2C2C2',
              padding: '0 12px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: formField?.ticketStatus?.value ? '#000000' : '#8E8E8E',
            }}
            className={formField?.ticketStatus?.error ? 'border-red-500' : ''}
          >
            <option value="">Select status</option>
            {ticketStatusOptions?.map((option: any) => (
              <option key={option?.value} value={option?.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formField?.ticketStatus?.error && (
            <p className="mt-1 text-xs text-red-500">
              {formField.ticketStatus.error}
            </p>
          )}
        </div>

        {/* Row 2: User Name and Email */}
        <div>
          <label
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '100%',
              color: '#2B2B2B',
              marginBottom: '8px',
              display: 'block',
            }}
          >
            User *
          </label>
          <select
            name="user"
            value={formField.user.value?._id || ''}
            onChange={(e) => {
              const selectedUserId = e.target.value;
              const selectedUser = users.find((u) => u._id === selectedUserId);
              if (selectedUser) {
                handleUserSelect(selectedUser);
              }
            }}
            disabled={edit}
            style={{
              width: '100%',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid #C2C2C2',
              padding: '0 12px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: formField.user.value ? '#000000' : '#8E8E8E',
            }}
            className={formField?.user?.error ? 'border-red-500' : ''}
          >
            <option value="">Select user</option>
            {isLoading ? (
              <option value="" disabled>
                Loading users...
              </option>
            ) : (
              users?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullName}
                </option>
              ))
            )}
          </select>
          {formField?.user?.error && (
            <p className="mt-1 text-xs text-red-500">{formField.user.error}</p>
          )}
        </div>

        <div>
          <label
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '100%',
              color: '#2B2B2B',
              marginBottom: '8px',
              display: 'block',
            }}
          >
            Email *
          </label>
          <input
            type="email"
            name="userEmail"
            value={formField?.userEmail?.value}
            readOnly
            style={{
              width: '100%',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid #C2C2C2',
              padding: '0 12px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: '#000000',
              backgroundColor: '#f5f5f5',
            }}
          />
        </div>

        {/* Row 3: Messages section */}
        <div className="md:col-span-2">
          <h2
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '18px',
              marginTop: '16px',
              marginBottom: '16px',
            }}
          >
            Messages
          </h2>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '100%',
                  color: '#2B2B2B',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                New Message *
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  setMessageError('');
                }}
                placeholder="Enter new message"
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid #C2C2C2',
                  padding: '0 12px',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#000000',
                }}
                className={messageError ? 'border-red-500' : ''}
              />
              {messageError && (
                <p className="mt-1 text-xs text-red-500">{messageError}</p>
              )}
               <div className="flex items-end">
              <button
                onClick={handleAddMessage}
                className="h-[38px] w-[114px] rounded-[10px] bg-[#187CFF] px-4 text-white"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '100%',
                  marginTop:"8px"
                }}
              >
                Add
              </button>
            </div>
            </div>

           
          </div>

          {/* Messages list */}
          {messages.length > 0 && (
            <div className="mb-6 mt-4 rounded-lg border border-gray-200 p-4">
              <h3
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '12px',
                }}
              >
                Added Messages
              </h3>

              {messages?.map((message: any, index: any) => (
                <div
                  key={index}
                  className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2"
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                      }}
                    >
                      {message?.comments}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      By: {message?.commentBy}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditMessage(index)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit message"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleRemoveMessage(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove message"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {generalError && (
            <p className="mb-4 text-sm text-red-500">{generalError}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={handleCancel}
          style={{
            width: '114px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: '#D7D7D7',
            color: '#626262',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '100%',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            width: '114px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: '#187CFF',
            color: '#FFFFFF',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '100%',
          }}
        >
          {edit ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
};

export default TicketForm;
