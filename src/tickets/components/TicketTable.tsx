/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { TicketModal } from './TicketModal';
import { ticketInsertField } from '../../helpers/ticket-helper';
import type { Ticket } from '../../types/ticket';
import { debounce } from 'lodash';
import {
  getTickets,
  deleteTicket,
  createTicket,
  updateTicket,
  searchTickets,
} from '../services/ticket.service';
import toast, { Toaster } from 'react-hot-toast';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Pagination from './Pagination';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

export const TicketTable = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formField, setFormField] = useState(ticketInsertField());
  const [isEditing, setIsEditing] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [page, limit, searchText]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let response;
      if (searchText) {
        response = await searchTickets(searchText, page, limit);
      } else {
        response = await getTickets(page, limit);
      }
      setTickets(response.data.tickets);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch tickets');
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    setFormField(ticketInsertField());
    setIsEditing(false);
    setCurrentTicketId(null);
    setIsModalOpen(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    const normalizedTicket = {
      ...ticket,
      user: typeof ticket.userId === 'object' ? ticket.userId : null,
    };

    setFormField(ticketInsertField(normalizedTicket));
    setIsEditing(true);
    setCurrentTicketId(ticket._id || null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (ticketId: string) => {
    setTicketToDelete(ticketId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (ticketToDelete) {
      try {
        await deleteTicket(ticketToDelete);
        setTickets(
          tickets?.filter((ticket: any) => ticket._id !== ticketToDelete)
        );
        toast.success('Ticket deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete ticket');
      }
    }
    setIsDeleteModalOpen(false);
    setTicketToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setPage(1);
  };

  const debouncedSearch = debounce((value) => {
    handleSearchChange(value);
  }, 300);

  return (
    <div>
      <Toaster position="top-center" />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tickets</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                debouncedSearch(e.target.value);
              }}
              placeholder="Search tickets..."
              className="rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleCreateTicket}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Create Ticket
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">Total records: {total}</div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg border bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ticket ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  USER NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Messages
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets?.map((ticket: any) => (
                <tr key={ticket?._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm">{ticket?.ticketId}</td>
                  <td className="px-4 py-4 text-sm capitalize">
                    {ticket?.ticketType}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {ticket?.userId?.fullName || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {ticket?.userId?.email || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {ticket?.messages?.map((message: any, index: any) => (
                      <div key={index} className={index > 0 ? 'mt-2' : ''}>
                        <p>{message.comments}</p>
                        <p className="text-xs text-gray-500">
                          Comment By: {message.commentBy}
                        </p>
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getStatusColor(ticket.ticketStatus)}`}
                    >
                      {ticket.ticketStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTicket(ticket)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit ticket"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ticket._id || '')}
                        className="text-red-600 hover:text-red-900"
                        title="Delete ticket"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalItems={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <TicketModal
        isOpenModal={isModalOpen}
        handleUpdateDialogClose={() => setIsModalOpen(false)}
        setFormField={setFormField}
        formField={formField}
        addTicketHandler={async (newTicket) => {
          try {
            if (isEditing && currentTicketId) {
              const updatedTicket = await updateTicket(
                currentTicketId,
                newTicket
              );
              setTickets(
                tickets?.map((ticket: any) =>
                  ticket?._id === currentTicketId ? updatedTicket : ticket
                )
              );
              toast.success('Ticket updated successfully');
            } else {
              const createdTicket = await createTicket(newTicket);
              setTickets([...tickets, createdTicket]);
              toast.success('Ticket created successfully');
            }
            setIsModalOpen(false);
            await fetchTickets();
          } catch (error: any) {
            toast.error(error.message || 'Failed to save ticket');
          }
        }}
        edit={isEditing}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName="ticket"
      />
    </div>
  );
};
