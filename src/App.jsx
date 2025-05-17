import { useEffect, useState } from 'react'
import './App.css'
import BalanceChart from './components/BalanceChart'; 
import CategoryPieChart from "./components/CategoryPieChart";
import Insights from "./components/Insights";



function App() {

  const [name, setName] = useState(""); // initial name set is empty
  const [dateTime, setDateTime] = useState("");
  const [description, setDescription] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [editingTransaction, setEditingTransaction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("name");
  const [initialBalance, setInitialBalance] = useState(0);
const [tempInitialBalance, setTempInitialBalance] = useState("");



  // using the useEffect Hook
  useEffect(() => {
    getTransactions().then(setTransactions);
  }, []);

  async function getTransactions() {
    const url = `${import.meta.env.VITE_REACT_APP_API_URL}/transaction`;
  
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch transactions:", error.message);
      return [];
    }
  }
  

  // this takes care of adding as well as updating transactions
  function addNewTransaction(event) {
    event.preventDefault();
    const price = parseFloat(name.split(' ')[0]);
    const urlBase = `${import.meta.env.VITE_REACT_APP_API_URL}/transaction`;
  
    const body = {
      price,
      name: name.substring(price.toString().length + 1),
      description,
      dateTime,
      category,
      type
    };
  
    if (editingTransaction) {
      // Update
      fetch(`${urlBase}/${editingTransaction._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((res) => res.json()).then((json) => {
        resetForm();
        getTransactions().then(setTransactions);
      });
    } else {
      // Create
      fetch(urlBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((res) => res.json()).then((json) => {
        resetForm();
        getTransactions().then(setTransactions);
      });
    }
  }
  
  function resetForm() {
    setName("");
    setDescription("");
    setDateTime("");
    setCategory("");
    setType("expense");
    setEditingTransaction(null);
  }
  
// Function to delete a transaction
  function deleteTransaction(id) {
    const url = `${import.meta.env.VITE_REACT_APP_API_URL}/transaction/${id}`;
    fetch(url, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        // Refresh transactions after delete
        getTransactions().then(setTransactions);
        resetForm();
      }
    });
  }

  // Format date for input
  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  }
  
  
// Calculate balance based on transactions
  let balance = initialBalance;
  for (const transaction of transactions) {
    if (transaction.type === "income") {
      balance += transaction.price;
    } else {
      balance -= transaction.price;
    }
  }
  
// Filter transactions based on search query and filter type
const filteredTransactions = transactions.filter((transaction) => {
  const value = transaction[searchFilter]?.toLowerCase();
  return value?.includes(searchQuery.toLowerCase());
});


// Function to export transactions to CSV
function exportToCSV() {
  const headers = ["Name", "Description", "Category", "Type", "Price", "DateTime"];
  const rows = filteredTransactions.map((txn) => [
    txn.name,
    txn.description,
    txn.category,
    txn.type,
    txn.price,
    txn.dateTime,
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") 
    + "\n" 
    + rows.map((row) => row.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



  return (
   <main>

  <div className="initial-balance-container">
    <label htmlFor="initial-balance">Set Initial Balance:</label>
    <input
      id="initial-balance"
      type="number"
      value={tempInitialBalance}
      onChange={(e) => setTempInitialBalance(e.target.value)}
      placeholder="e.g. 1000 or -500"
      className="initial-balance-input"
    />
    <button
      type="button"
      className="set-balance-button"
      onClick={() => {
        const parsed = parseFloat(tempInitialBalance);
        if (!isNaN(parsed)) {
          setInitialBalance(parsed);
          setTempInitialBalance(""); 
        }
      }}
    >
      Set
    </button>
  </div>


    
    <h1 style={{ color: balance >= 0 ? "#1c1" : "#c11" }}>
      ₹{balance}
    </h1>


    <form action="" onSubmit={addNewTransaction}>

      <div className='basic'>
        <input type="text" 
        value={name} 
        onChange={(event) => setName(event.target.value)} 
        placeholder= { "amount <space> service / product"} />

        <input type="datetime-local" 
        value={dateTime} 
        onChange={(event) => setDateTime(event.target.value)} />
      </div>

      <div className='description'>
        <input type="text" 
        value={description} 
        onChange={(event) => setDescription(event.target.value)} placeholder='description'/>
      </div>

      <div className='category'>
        <select 
          value={category} 
          onChange={(event) => setCategory(event.target.value)}
          required
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Salary">Salary</option>
          <option value="Utilities">Utilities</option>
          <option value="Shopping">Shopping</option>
          <option value="Others">Others</option>
        </select>
      </div>

      <div className="type-toggle">
        <button
          type="button"
          className={`type-button ${type === "expense" ? "expense-active" : ""}`}
          onClick={() => setType("expense")}
        >
          Expense
        </button>
        <button
          type="button"
          className={`type-button ${type === "income" ? "income-active" : ""}`}
          onClick={() => setType("income")}
        >
          Income
        </button>
      </div>



      <button>Add New Transaction</button>
    </form>

  


{/* SEARCH BAR */}
{transactions.length > 0 && (
  <div className="search-bar">
  <select
    value={searchFilter}
    onChange={(e) => setSearchFilter(e.target.value)}
    className="search-filter"
  >
    <option value="name">Product</option>
    <option value="description">Description</option>
    <option value="category">Category</option>
  </select>

  <input
    type="text"
    placeholder={`Search by ${searchFilter}`}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="search-input"
  />
</div>
)}

{transactions.length > 0 && (
  <div className="export-section">
  <button className="export-button" onClick={exportToCSV}>
    📤 Export as CSV
  </button>
</div>
)}




{/* TRANSACTIONS LIST */}
<div className="transactions">
  {filteredTransactions.length > 0 ? (
    filteredTransactions.map((transaction) => (
      <div key={transaction._id}>
        <div className="transaction">
          <div className="left">
            <div className="name">{transaction.name}</div>
            <div className="description">{transaction.description}</div>
            <div className="category">
              <strong>Category: </strong>
              {transaction.category}
            </div>
          </div>
          <div className="right">
            <div
              className={
                "price " + (transaction.type === "expense" ? "red" : "green")
              }
            >
              ₹{transaction.price}
            </div>

            <div className="datetime">{transaction.dateTime}</div>

            <div className="actions">
              <button
                className="edit-button"
                onClick={() => {
                  setEditingTransaction(transaction);
                  setName(`${transaction.price} ${transaction.name}`);
                  setDescription(transaction.description);
                  setDateTime(formatDateForInput(transaction.dateTime));
                  setCategory(transaction.category);
                  setType(transaction.type);
                }}
              >
                ✏️
              </button>

              <button
                className="delete-button"
                onClick={() => deleteTransaction(transaction._id)}
              >
                ❌
              </button>
            </div>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="no-data">
      <p>No matching transactions found.</p>
    </div>
  )}
</div>

{/* CHARTS */}
<div className="charts-container">
  {Array.isArray(transactions) && transactions.length > 0 ? (
    <>
      <div className="chart-container">
        <BalanceChart transactions={transactions} />
      </div>
      <div className="chart-container">
        <CategoryPieChart transactions={transactions} />
      </div>
    </>
  ) : (
    <div className="no-data full">
      <p>No transactions yet to display charts.</p>
    </div>
  )}
</div>

{transactions.length > 0 && (
  <Insights transactions={transactions} />
)}



    </main>
  );
}

export default App