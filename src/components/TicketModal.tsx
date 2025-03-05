import type React from "react"
import { useState } from "react"
// import type { Ticket, TicketFormFields, TicketMessage } from "../types/ticket"
// import type { TicketStatus, TicketType } from "../types/ticket"
// import { ticketTypeOptions, ticketStatusOptions, customerIdOptions, generateTicketId } from "../lib/ticket-helper"
import { Ticket, TicketFormFields, TicketMessage, TicketStatus, TicketType } from "../types/ticket"
import { ticketTypeOptions, ticketStatusOptions, customerIdOptions, generateTicketId } from "../helpers/ticket-helper"

interface TicketModalProps {
  isOpenModal: boolean
  handleUpdateDialogClose: () => void
  setFormField: (formField: TicketFormFields) => void
  formField: TicketFormFields
  addTicketHandler: (ticket: Ticket) => void
  edit: boolean
}

export function TicketModal({
  isOpenModal,
  handleUpdateDialogClose,
  setFormField,
  formField,
  addTicketHandler,
  edit,
}: TicketModalProps) {
  const [messages, setMessages] = useState<TicketMessage[]>(edit ? formField.messages : [])
  const [newMessage, setNewMessage] = useState("")
  const [newCommentBy, setNewCommentBy] = useState("")

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormField({
      ...formField,
      [name]: {
        ...formField[name as keyof TicketFormFields],
        value: value,
        error: "",
      },
    })
  }

  const validateForm = (): boolean => {
    let isValid = true
    const newFormField = { ...formField }

    if (!formField.ticketType.value) {
      newFormField.ticketType.error = "Ticket type is required"
      isValid = false
    }

    if (!formField.customerId.value) {
      newFormField.customerId.error = "Customer ID is required"
      isValid = false
    }

    if (messages.length === 0) {
      isValid = false
      // You might want to show this error somewhere in the UI
    }

    setFormField(newFormField)
    return isValid
  }

  const handleAddMessage = () => {
    if (newMessage && newCommentBy) {
      setMessages([...messages, { comments: newMessage, commentBy: newCommentBy }])
      setNewMessage("")
      setNewCommentBy("")
    }
  }

  const handleRemoveMessage = (index: number) => {
    setMessages(messages.filter((_:any, i:any) => i !== index))
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const ticketId = edit ? formField.ticketId.value : generateTicketId()

    const newTicket: Ticket = {
      ticketId,
      ticketType: formField.ticketType.value as TicketType,
      customerId: formField.customerId.value,
      messages: messages,
      ticketStatus: formField.ticketStatus.value as TicketStatus,
    }

    addTicketHandler(newTicket)
  }

  if (!isOpenModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{edit ? "Update Ticket" : "Create Ticket"}</h2>
            <button onClick={handleUpdateDialogClose} className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">
                Ticket Type <span className="text-red-500">*</span>
              </label>
              <select
                name="ticketType"
                value={formField.ticketType.value}
                onChange={handleOnChange}
                className={`w-full p-2 border rounded-md ${
                  formField.ticketType.error ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Ticket Type</option>
                {ticketTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formField.ticketType.error && <p className="text-red-500 text-xs mt-1">{formField.ticketType.error}</p>}
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">
                Customer ID <span className="text-red-500">*</span>
              </label>
              <select
                name="customerId"
                value={formField.customerId.value}
                onChange={handleOnChange}
                className={`w-full p-2 border rounded-md ${
                  formField.customerId.error ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Customer ID</option>
                {customerIdOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formField.customerId.error && <p className="text-red-500 text-xs mt-1">{formField.customerId.error}</p>}
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="ticketStatus"
                value={formField.ticketStatus.value}
                onChange={handleOnChange}
                className={`w-full p-2 border rounded-md ${
                  formField.ticketStatus.error ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Status</option>
                {ticketStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formField.ticketStatus.error && (
                <p className="text-red-500 text-xs mt-1">{formField.ticketStatus.error}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Messages</label>
              {messages.map((message, index) => (
                <div key={index} className="flex items-center mb-2">
                  <p className="flex-grow">
                    {message.comments} - By: {message.commentBy}
                  </p>
                  <button onClick={() => handleRemoveMessage(index)} className="ml-2 text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Enter new message"
                  className="flex-grow p-2 border rounded-md border-gray-300 mr-2"
                />
                <input
                  type="text"
                  value={newCommentBy}
                  onChange={(e) => setNewCommentBy(e.target.value)}
                  placeholder="Comment by"
                  className="w-1/3 p-2 border rounded-md border-gray-300 mr-2"
                />
                <button
                  onClick={handleAddMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              onClick={handleUpdateDialogClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              {edit ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

