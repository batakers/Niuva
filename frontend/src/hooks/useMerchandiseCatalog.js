import React, { useState, useEffect } from "react";

const STORAGE_KEY = "niuva_merchandise_catalog";

const DEFAULT_CATALOG = [
  {
    id: 1,
    name: "T-Shirt",
    basePrice: 75000,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Midnight Blue", "Steel Gray", "Frost White", "Sky Blue"],
    printMethods: [
      { name: "Screen Print", price: 25000, minOrder: 10 },
      { name: "Embroidery", price: 35000, minOrder: 5 },
      { name: "Direct Print", price: 30000, minOrder: 1 },
    ],
    description: "Kaos berkualitas tinggi dengan material premium",
    image: "👕",
  },
  {
    id: 2,
    name: "Hoodie",
    basePrice: 150000,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Midnight Blue", "Steel Gray", "Black"],
    printMethods: [
      { name: "Embroidery", price: 45000, minOrder: 5 },
      { name: "Screen Print", price: 35000, minOrder: 10 },
    ],
    description: "Hoodie premium dengan desain modern",
    image: "🧥",
  },
  {
    id: 3,
    name: "Cap",
    basePrice: 45000,
    sizes: ["One Size"],
    colors: ["Niuva Blue", "Black", "White"],
    printMethods: [
      { name: "Embroidery", price: 20000, minOrder: 5 },
      { name: "Screen Print", price: 15000, minOrder: 10 },
    ],
    description: "Topi dengan logo NIUVA minimalis",
    image: "🧢",
  },
  {
    id: 4,
    name: "Tote Bag",
    basePrice: 65000,
    sizes: ["One Size"],
    colors: ["Natural", "Midnight Blue", "Black"],
    printMethods: [
      { name: "Screen Print", price: 25000, minOrder: 10 },
      { name: "Embroidery", price: 30000, minOrder: 5 },
    ],
    description: "Tas tote berkualitas untuk branding",
    image: "🛍️",
  },
  {
    id: 5,
    name: "Hoodie Zip",
    basePrice: 180000,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Midnight Blue", "Steel Gray"],
    printMethods: [
      { name: "Embroidery", price: 55000, minOrder: 5 },
      { name: "Screen Print", price: 45000, minOrder: 10 },
    ],
    description: "Hoodie dengan zipper premium",
    image: "🧥",
  },
  {
    id: 6,
    name: "Mug",
    basePrice: 40000,
    sizes: ["One Size"],
    colors: ["White", "Black"],
    printMethods: [
      { name: "Cetak Full Color", price: 15000, minOrder: 12 },
      { name: "Sablon", price: 10000, minOrder: 24 },
    ],
    description: "Mug ceramic dengan kualitas premium",
    image: "☕",
  },
];

export function useMerchandiseCatalog() {
  const [catalog, setCatalog] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_CATALOG;
    } catch (e) {
      console.error("Error loading catalog:", e);
      return DEFAULT_CATALOG;
    }
  });

  const saveCatalog = (newCatalog) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCatalog));
      setCatalog(newCatalog);
    } catch (e) {
      console.error("Error saving catalog:", e);
    }
  };

  const addProduct = (product) => {
    const newId = Math.max(...catalog.map((p) => p.id), 0) + 1;
    const newCatalog = [...catalog, { ...product, id: newId }];
    saveCatalog(newCatalog);
    return newId;
  };

  const updateProduct = (id, updates) => {
    const newCatalog = catalog.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveCatalog(newCatalog);
  };

  const deleteProduct = (id) => {
    const newCatalog = catalog.filter((p) => p.id !== id);
    saveCatalog(newCatalog);
  };

  const resetToDefault = () => {
    saveCatalog(DEFAULT_CATALOG);
  };

  return {
    catalog,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
  };
}
