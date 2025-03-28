/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
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
import { FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface TicketModalProps {
  isOpenModal: boolean;
  handleUpdateDialogClose: () => void;
  setFormField: (formField: TicketFormFields) => void;
  formField: TicketFormFields;
  addTicketHandler: (ticket: Ticket) => void;
  edit: boolean;
}

export const TicketModal = ({
  isOpenModal,
  handleUpdateDialogClose,
  setFormField,
  formField,
  addTicketHandler,
  edit,
}: TicketModalProps) => {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [messageError, setMessageError] = useState('');
  const [generalError, setGeneralError] = useState('');  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{_id: string, fullName: string} | null>(null);

  useEffect(() => {
    try {
      const imzClientData = localStorage.getItem('imzClient');
      if (imzClientData) {
        const parsedData = JSON.parse(imzClientData);
        if (parsedData.userData) {
          setCurrentUser({
            _id: parsedData.userData._id,
            fullName: parsedData.userData.fullName
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

  const handleCloseModal = () => {
    resetForm();
    handleUpdateDialogClose();
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
            commentBy: currentUser.fullName 
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
    if (!validateForm() || !currentUser) return;

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

  if (!isOpenModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {edit ? 'Update Ticket' : 'Create Ticket'}
            </h2>
            <button
              onClick={handleUpdateDialogClose}
              className="text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="col-span-1">
              <label className="mb-1 block text-sm font-medium">
                Ticket Type <span className="text-red-500">*</span>
              </label>
              <select
                name="ticketType"
                value={formField?.ticketType?.value}
                onChange={handleOnChange}
                className={`w-full rounded-md border p-2 ${
                  formField?.ticketType?.error
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Ticket Type</option>
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

            <div className="col-span-1">
              <label className="mb-1 block text-sm font-medium">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="ticketStatus"
                value={formField?.ticketStatus?.value}
                onChange={handleOnChange}
                className={`w-full rounded-md border p-2 ${
                  formField?.ticketStatus?.error
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Status</option>
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

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">
                User <span className="text-red-500">*</span>
              </label>
              <select
                name="user"
                value={formField.user.value?._id || ""}
                onChange={(e) => {
                  const selectedUserId = e.target.value;
                  const selectedUser = users.find(u => u._id === selectedUserId);
                  if (selectedUser) {
                    handleUserSelect(selectedUser);
                  }
                }}
                disabled={edit}
                className={`w-full rounded-md border p-2 ${
                  formField?.user?.error
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select User</option>
                {isLoading ? (
                  <option value="" disabled>Loading users...</option>
                ) : (
                  users?.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName}
                    </option>
                  ))
                )}
              </select>
              {formField?.user?.error && (
                <p className="mt-1 text-xs text-red-500">
                  {formField.user.error}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">
                User Email
              </label>
              <input
                type="email"
                name="userEmail"
                value={formField?.userEmail?.value}
                readOnly
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Messages</label>
              {messages?.map((message: any, index: any) => (
                <div key={index} className="mb-2 flex items-center">
                  <p className="flex-grow">
                    {message?.comments} -Comment By: {message?.commentBy}
                  </p>
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
              <div className="mt-3 space-y-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    New Message <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e: any) => {
                          setNewMessage(e?.target?.value);
                          setMessageError('');
                        }}
                        placeholder="Enter new message"
                        className={`w-full rounded-md border p-2 ${messageError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {messageError && (
                        <p className="mt-1 text-xs text-red-500">
                          {messageError}
                        </p>
                      )}
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddMessage}
                        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                      >
                        {editingMessageIndex !== null ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {generalError && (
            <p className="mt-4 text-sm text-red-500">{generalError}</p>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handleCloseModal}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              {edit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};