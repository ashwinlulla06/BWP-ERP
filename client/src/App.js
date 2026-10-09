import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import BookCatalog from "./pages/books/BookCatalog";
import ReserveBook from "./pages/books/ReserveBook";
import MyReservations from "./pages/books/MyReservations";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/books" />} />
          <Route path="/books" element={<BookCatalog />} />
          <Route path="/reserve/:id" element={<ReserveBook />} />
          <Route path="/my-reservations" element={<MyReservations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
