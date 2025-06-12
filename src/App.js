import React, { useState, useEffect, useRef, useCallback } from "react";
import { getAll, post, put, deleteById } from "./memdb.js";
import validator from "validator";
import "./App.css";

function log(...message) {
  console.log(...message);
}

const blankCustomer = { id: -1, name: "", email: "", password: "" };

export function App(params) {
  const [customers, setCustomers] = useState([]);
  const [formObject, setFormObject] = useState(blankCustomer);
  const [showPassword, setShowPassword] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);

  const announcerRef = useRef(null);
  const rowRefs = useRef({});

  const mode = formObject.id >= 0 ? "Update" : "Add";

  const announce = useCallback((text) => {
    setAnnouncement(text);
    log("Announcing:", text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleListClick = useCallback(
    (item) => {
      log("in handleListClick()");

      const isCurrentlySelected = formObject.id === item.id;

      if (isCurrentlySelected) {
        setFormObject(blankCustomer);
        announce(`Row for ${item.name} was deselected. Form cleared.`);
        return;
      }

      setFormObject(item);

      setTimeout(() => {
        const rowEl = rowRefs.current[item.id];
        if (!rowEl) return;

        const style = window.getComputedStyle(rowEl);
        const isBold =
          style.fontWeight === "bold" || parseInt(style.fontWeight) >= 600;
        const isHighlighted =
          style.backgroundColor === "rgb(178, 250, 180)" ||
          style.backgroundColor.toLowerCase() === "#b2fab4";

        const message = `Selected row: ${item.name}, ${item.email}, ${
          item.password
        }. ${
          isBold && isHighlighted
            ? "Row is bold and highlighted."
            : isBold
            ? "Row is bold."
            : isHighlighted
            ? "Row is highlighted."
            : "Row is not styled."
        }`;

        announce(message);
      }, 0);
    },
    [formObject.id, announce]
  );

  const getCustomers = () => {
    log("in getCustomers()");
    setCustomers(getAll());
  };

  useEffect(() => {
    getCustomers();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!customers.length) return;

      if (e.key === "ArrowDown") {
        setFocusedIndex((i) => Math.min(i + 1, customers.length - 1));
      } else if (e.key === "ArrowUp") {
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const item = customers[focusedIndex];
        if (item) handleListClick(item);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customers, focusedIndex, handleListClick]);

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
    announce("Form cleared.");
  };

  const onDeleteClick = () => {
    log("in onDeleteClick()");
    if (formObject.id >= 0) {
      deleteById(formObject.id);
      setFormObject(blankCustomer);
      getCustomers();
      announce("Customer deleted.");
    }
  };

  const onSaveClick = () => {
    log("in onSaveClick()");
    const { name, email, password } = formObject;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      announce(
        "All fields are required. Please complete name, email, and password."
      );
      return;
    }

    if (!validator.isEmail(trimmedEmail)) {
      announce("Invalid email format. Please enter a valid email address.");
      return;
    }

    const updatedCustomer = {
      ...formObject,
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
    };

    if (formObject.id >= 0) {
      put(formObject.id, updatedCustomer);
      announce("Customer updated.");
    } else {
      post(updatedCustomer);
      announce("Customer added.");
    }

    setFormObject(blankCustomer);
    getCustomers();
  };

  return (
    <div>
      {/* Screen reader + speech live region */}
      <div
        id="live-announcer"
        role="status"
        aria-live="polite"
        ref={announcerRef}
      >
        {announcement}
      </div>

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
            {customers.map((item, index) => {
              const isSelected = item.id === formObject.id;
              const isFocused = focusedIndex === index;
              return (
                <tr
                  key={item.id}
                  ref={(el) => (rowRefs.current[item.id] = el)}
                  className={`${isSelected ? "selected" : ""} ${
                    isFocused ? "focused" : ""
                  }`}
                  tabIndex={0}
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formObject.password}
                    onChange={handleInputChange}
                    placeholder="password"
                  />
                  <div className="show-password-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => {
                          log("toggled showPassword");
                          setShowPassword((prev) => !prev);
                        }}
                      />{" "}
                      Show Password
                    </label>
                  </div>
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
