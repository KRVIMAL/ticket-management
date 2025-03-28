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
import { FiX, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

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
  const [newCommentBy, setNewCommentBy] = useState('');
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(
    null
  );
  const [messageError, setMessageError] = useState('');
  const [commentByError, setCommentByError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [userSearchText, setUserSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserResults, setShowUserResults] = useState(false);

  const debouncedSearch = useRef(
    _.debounce((text: string) => {
      setDebouncedSearchText(text);
    }, 500)
  ).current;

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (edit && formField.user.value) {
      setUserSearchText(formField.user.value.fullName);
      setDebouncedSearchText(formField.user.value.fullName);
    }
  }, [edit, formField.user.value]);

  useEffect(() => {
    if (edit && formField.messages) {
      setMessages(formField.messages);
    } else {
      setMessages([]);
    }
  }, [edit, formField.messages]);

  // Handle user search
  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedSearchText.trim().length < 2) {
        setUsers([]);
        return;
      }

      setIsSearching(true);
      try {
        const search = { fullName: debouncedSearchText };
        const response = await searchUsers(1, 10, search);
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchUsers();
  }, [debouncedSearchText]);

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
    setNewCommentBy('');
    setEditingMessageIndex(null);
    setMessageError('');
    setCommentByError('');
    setGeneralError('');
    setUserSearchText('');
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
    setUserSearchText(user.fullName);
    setShowUserResults(false);
  };

  const validateMessageFields = (): boolean => {
    let isValid = true;
    setMessageError('');
    setCommentByError('');

    if (!newMessage.trim()) {
      setMessageError('Message is required');
      isValid = false;
    }

    if (!newCommentBy.trim()) {
      setCommentByError('Comment by is required');
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
    if (validateMessageFields()) {
      if (editingMessageIndex !== null) {
        const updatedMessages = [...messages];
        updatedMessages[editingMessageIndex] = {
          ...updatedMessages[editingMessageIndex],
          comments: newMessage,
          commentBy: newCommentBy,
        };
        setMessages(updatedMessages);
        setEditingMessageIndex(null);
      } else {
        setMessages([
          ...messages,
          { comments: newMessage, commentBy: newCommentBy },
        ]);
      }
      setNewMessage('');
      setNewCommentBy('');
      setMessageError('');
      setCommentByError('');
      setGeneralError('');
    }
  };

  const handleEditMessage = (index: number) => {
    const messageToEdit = messages[index];
    setNewMessage(messageToEdit.comments);
    setNewCommentBy(messageToEdit.commentBy);
    setEditingMessageIndex(index);
    setMessageError('');
    setCommentByError('');
  };

  const handleRemoveMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
    if (editingMessageIndex === index) {
      setEditingMessageIndex(null);
      setNewMessage('');
      setNewCommentBy('');
      setMessageError('');
      setCommentByError('');
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
              <div className="relative">
                <input
                  type="text"
                  value={userSearchText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUserSearchText(value);
                    debouncedSearch(value);
                    setShowUserResults(true);
                    if (!edit) {
                      setFormField({
                        ...formField,
                        user: {
                          value: null,
                          error: '',
                        },
                        userEmail: {
                          value: '',
                          error: '',
                        },
                      });
                    }
                  }}
                  placeholder="Search user by name"
                  disabled={edit}
                  className={`w-full rounded-md border p-2 ${
                    formField?.user?.error
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  onFocus={() => setShowUserResults(true)}
                />
                {!edit && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400">
                    <FiSearch />
                  </span>
                )}
                {showUserResults && !edit && users.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
                    {isSearching ? (
                      <div className="p-2 text-center text-gray-500">
                        Searching...
                      </div>
                    ) : (
                      users.map((user) => (
                        <div
                          key={user._id}
                          className="cursor-pointer p-2 hover:bg-gray-100"
                          onClick={() => handleUserSelect(user)}
                        >
                          <div>{user.fullName}</div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
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
                    {message?.comments} - By: {message?.commentBy}
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
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="flex-grow">
                    <label className="mb-1 block text-sm font-medium">
                      New Message <span className="text-red-500">*</span>
                    </label>
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
                  <div className="w-1/3">
                    <label className="mb-1 block text-sm font-medium">
                      Comment By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCommentBy}
                      onChange={(e: any) => {
                        setNewCommentBy(e?.target?.value);
                        setCommentByError('');
                      }}
                      placeholder="Enter your staff ID"
                      className={`w-full rounded-md border p-2 ${
                        commentByError ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {commentByError && (
                      <p className="mt-1 text-xs text-red-500">
                        {commentByError}
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
