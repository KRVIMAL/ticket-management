import TicketListing from "./components/TicketListing"
import "./App.css"

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Ticket Management System</h1>
      <TicketListing />
     </div>
  )
}

export default App

