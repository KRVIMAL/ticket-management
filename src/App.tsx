import { TicketTable } from './tickets/components/TicketTable';
import './App.css';

function App() {
  return (
    <div className="container mx-auto p-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
      <TicketTable />
    </div>
  );
}

export default App;
