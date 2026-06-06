"use client";
import React, { useState } from "react";

interface ColorsDropdownProps {
  attributes: { name: string; products: number }[];
  selectedAttribute: string | null;
  onSelect: (attr: string) => void;
  category: string | null;
}

const colorMap: Record<string, string> = {
  // Magic colors
  "W": "#F0E6D2",
  "U": "#0E68AB",
  "B": "#150B00",
  "R": "#D3202A",
  "G": "#00733E",
  "Incolora": "#C0C0C0",
  // Pokemon colors/types
  "Colorless": "#A8A878", // Normal type in Pokemon
  "Fire": "#F08030",
  "Water": "#6890F0",
  "Grass": "#78C850",
  "Electric": "#F8D030",
  "Psychic": "#F85888",
  "Ice": "#98D8D8",
  "Dragon": "#7038F8",
  "Dark": "#705848",
  "Fairy": "#EE99AC",
  "Normal": "#A8A878",
  "Fighting": "#C03028",
  "Flying": "#A890F0",
  "Poison": "#A040A0",
  "Ground": "#E0C068",
  "Rock": "#B8A038",
  "Bug": "#A8B820",
  "Ghost": "#705898",
  "Steel": "#B8B8D0",
};

const magicTextMap: Record<string, string> = {
  "W": "Blanco",
  "U": "Azul",
  "B": "Negro",
  "R": "Rojo",
  "G": "Verde",
  "Incolora": "Colorless"
};

const ColorsDropdwon: React.FC<ColorsDropdownProps> = ({
  attributes,
  selectedAttribute,
  onSelect,
  category
}) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  // Determinar el título basado en la categoría
  const isMagic = category?.includes("Magic");
  const isPokemon = category?.includes("Pokemon");
  const title = isPokemon ? "Tipos" : isMagic ? "Identidad de Color" : "Atributos";

  return (
    <div className="bg-[#1a1d24] shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${toggleDropdown ? "border-b border-stroke" : ""
          }`}
      >
        <p className="text-white font-medium">{title}</p>
        <button
          aria-label="button for colors dropdown"
          className={`text-white ease-out duration-200 ${toggleDropdown && "rotate-180"
            }`}
          onClick={(e) => { e.preventDefault(); setToggleDropdown(!toggleDropdown); }}
        >
          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* <!-- dropdown menu --> */}
      <div className={`p-6 flex flex-col gap-3 ${toggleDropdown ? "flex" : "hidden"}`}>
        {attributes.map((attr, key) => {
          const isSelected = selectedAttribute === attr.name;
          // Color code, default to a gray if not found
          const hexColor = colorMap[attr.name] || "#bbb";

          let displayName = attr.name;
          if (isMagic) {
            displayName = magicTextMap[attr.name] || attr.name;
          } else if (isPokemon) {
            if (attr.name === "Colorless") displayName = "Normal";
            if (attr.name === "Incolora") displayName = "Colorless";
          }

          return (
            <label
              key={key}
              className="cursor-pointer select-none flex items-center justify-between hover:bg-[#111318] px-2 py-1 rounded"
              onClick={(e) => {
                e.preventDefault();
                onSelect(attr.name);
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-5.5 h-5.5 rounded-full ${isSelected ? "border-2" : "border"
                    } border-stroke`}
                  style={{ borderColor: isSelected ? hexColor : '#e2e8f0' }}
                >
                  <span
                    className="block w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: hexColor }}
                  ></span>
                </div>
                <span className={`text-base ${isSelected ? "text-blue font-medium" : "text-white"}`}>
                  {displayName}
                </span>
              </div>
              <span className="text-gray-5 text-sm">({attr.products})</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ColorsDropdwon;
