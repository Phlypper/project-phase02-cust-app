import React, { useState, useEffect } from "react";
import { getAll, post, put, deleteById } from "./memdb.js";
import "./App.css";

function log(message) {
  console.log(message);
}

const blankCustomer = { id: -1, name: "", email: "", password: "" };

export function App(params) {
  const [customers, setCustomers] = useState([]);
  const [formObject, setFormObject] = useState(blankCustomer);
  const mode = formObject.id >= 0 ? "Update" : "Add";

  const getCustomers = () => {
    log("in getCustomers()");
    setCustomers(getAll());
  };

  useEffect(() => {
    getCustomers();
  }, []);

  const handleListClick = (item) => {
    log("in handleListClick()");
    setFormObject(item);
  };

  const handleInputChange = (event) => {
    log("in handleInputChange()");
    const { name, value } = event.target;
    setFormObject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onCancelClick = () => {
    log("in onCancelClick()");
    setFormObject(blankCustomer);
  };

  const onDeleteClick = () => {
    log("in onDeleteClick()");
    if (formObject.id >= 0) {
      deleteById(formObject.id);
      setFormObject(blankCustomer);
      getCustomers();
    }
  };

  const onSaveClick = () => {
    log("in onSaveClick()");
    if (formObject.id >= 0) {
      put(formObject.id, formObject);
    } else {
      post(formObject);
    }
    setFormObject(blankCustomer);
    getCustomers();
  };

  return (
    <div>
      <div className="boxed">
        <h4>Customer List</h4>
        <table id="customer-list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Pass</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((item) => {
              const isSelected = item.id === formObject.id;
              return (
                <tr
                  key={item.id}
                  className={isSelected ? "selected" : ""}
                  onClick={() => handleListClick(item)}
                >
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.password}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="boxed">
        <div>
          <h4>{mode}</h4>
        </div>
        <form>
          <table id="customer-add-update">
            <tbody>
              <tr>
                <td className="label">Name:</td>
                <td>
                  <input
                    type="text"
                    name="name"
                    value={formObject.name}
                    onChange={handleInputChange}
                    placeholder="Customer Name"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="label">Email:</td>
                <td>
                  <input
                    type="email"
                    name="email"
                    value={formObject.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                  />
                </td>
              </tr>
              <tr>
                <td className="label">Pass:</td>
                <td>
                  <input
                    type="password"
                    name="password"
                    value={formObject.password}
                    onChange={handleInputChange}
                    placeholder="password"
                  />
                </td>
              </tr>
              <tr className="button-bar">
                <td colSpan="2">
                  <input type="button" value="Delete" onClick={onDeleteClick} />
                  <input type="button" value="Save" onClick={onSaveClick} />
                  <input type="button" value="Cancel" onClick={onCancelClick} />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}

export default App;
