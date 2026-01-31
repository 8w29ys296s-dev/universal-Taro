export type SpreadType = 'daily' | 'three_card' | 'hexagram';

export interface Card {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  desc: string; // Chinese description
  descEn: string; // English description
  isUpright: boolean;
}

export interface Reading {
  id: string;
  date: string; // ISO string
  spreadType: SpreadType;
  spreadName: string;
  question: string;
  cards: Card[];
  interpretation: string;
  language?: 'zh' | 'en'; // Store the language of the reading
}

export interface SpreadConfig {
  id: SpreadType;
  name: string;
  nameEn: string;
  cost: number;
  description: string;
  descriptionEn: string;
  cardCount: number;
  positions: string[];
  positionsEn: string[];
}

export interface UserState {
  balance: number;
  readings: Reading[];
}