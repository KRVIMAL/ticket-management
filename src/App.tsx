import { TicketTable } from './tickets/components/TicketTable';
import './App.css';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Ticket Management System
      </h1>
      <TicketTable />
    </div>
  );
}

export default App;
