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
        return 'bg-[#8EDF5B] text-black';
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
    <div style={{fontFamily: 'Montserrat, sans-serif'}}>
      <Toaster position="top-center" />
      
      {/* Header section with search and create button */}
      <div className="mb-6 flex items-center justify-end">
        <div className="relative mr-4">
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              debouncedSearch(e.target.value);
            }}
            placeholder="Search"
            className="h-[39px] w-[105px] rounded-[6px] border border-[#CDCDCD] px-3 py-2 focus:outline-none"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
          className="h-[39px] w-[137px] rounded-[6px] bg-blue-500 text-white"
        >
          Create Ticket
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Table header */}
          <div className="mb-4 rounded-[14px] bg-[#F1F1F1] px-4 py-3 font-['Montserrat']">
            <div className="grid grid-cols-6 items-center gap-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: '100%', color: '#000000' }}>Ticket Id</div>
              <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: '100%', color: '#000000' }}>User name</div>
              <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: '100%', color: '#000000' }}>Type</div>
              <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: '100%', color: '#000000' }}>Messages</div>
              <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: '100%', color: '#000000' }}>Status</div>
              <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: '100%', color: '#000000' }}>Action</div>
            </div>
          </div>

          {/* Table body */}
          <div className="w-full">
            {tickets?.map((ticket: any, index: number) => (
              <div 
                key={ticket?._id} 
                className={`grid grid-cols-6 items-center gap-4 px-4 py-2.5 ${
                  index !== tickets.length - 1 ? 'border-b border-[#C2C2C2]' : ''
                }`}
              >
                <div className="text-[15px] font-medium">{ticket?.ticketId}</div>
                <div className="flex items-center text-[15px] font-medium">
                  <div className="mr-2 h-8 w-8 overflow-hidden rounded-full bg-blue-500 text-center text-white">
                    {ticket?.userId?.fullName ? ticket.userId.fullName.charAt(0) : 'U'}
                  </div>
                  {ticket?.userId?.fullName || 'N/A'}
                </div>
                <div className="text-[15px] font-medium capitalize">
                  {ticket?.ticketType}
                </div>
                <div className="text-[15px] font-medium">
                  {ticket?.messages?.length > 0 ? (
                    <div>
                      <p>{ticket.messages[0].comments}</p>
                      <p className="text-xs text-gray-500">
                        By: {ticket.messages[0].commentBy}
                      </p>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </div>
                <div>
                  <span
                    className={`inline-block h-[25px] w-[94px] rounded-[18px] text-center text-[15px] font-medium leading-[25px] ${getStatusColor(ticket.ticketStatus)}`}
                  >
                    {ticket.ticketStatus}
                  </span>
                </div>
                <div className="flex space-x-4">
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
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
