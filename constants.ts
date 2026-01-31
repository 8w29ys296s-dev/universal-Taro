import { SpreadConfig, Card } from './types';

// BEHAVIORAL ECONOMICS CONSTANTS
export const UNLOCK_THRESHOLD = 1280; // The Goal (Coins/Points)
export const ENDOWED_PROGRESS = 200; // The "Head Start" (15.6%)

export const SPREADS: Record<string, SpreadConfig> = {
  daily: {
    id: 'daily',
    name: '每日指引',
    nameEn: 'Daily Guidance',
    cost: 10,
    description: '单张牌 · 洞察今日运势与灵感',
    descriptionEn: 'Single Card · Insight for the day',
    cardCount: 1,
    positions: ['今日指引'],
    positionsEn: ['Daily Guidance']
  },
  three_card: {
    id: 'three_card',
    name: '三张牌',
    nameEn: 'Three Card Spread',
    cost: 30,
    description: '时间流 · 解析过去、现在与未来',
    descriptionEn: 'Time Flow · Past, Present, Future',
    cardCount: 3,
    positions: ['过去', '现在', '未来'],
    positionsEn: ['Past', 'Present', 'Future']
  },
  hexagram: {
    id: 'hexagram',
    name: '六芒星阵法',
    nameEn: 'Hexagram Star',
    cost: 70,
    description: '全方位 · 深度剖析复杂问题',
    descriptionEn: 'Comprehensive · Deep analysis',
    cardCount: 7,
    positions: ['过去', '未来', '现在', '对策', '环境', '结果', '核心'],
    positionsEn: ['Past', 'Future', 'Present', 'Action', 'Environment', 'Outcome', 'Core']
  }
};

export const MOCK_CARDS: Omit<Card, 'isUpright'>[] = [
  // Major Arcana (0-21)
  { id: '0', name: '愚者', nameEn: 'The Fool', image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg', desc: '新的开始，冒险，纯真', descEn: 'New beginnings, innocence, adventure' },
  { id: '1', name: '魔术师', nameEn: 'The Magician', image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg', desc: '创造力，技能，意志力', descEn: 'Manifestation, resourcefulness, power' },
  { id: '2', name: '女祭司', nameEn: 'The High Priestess', image: 'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg', desc: '直觉，潜意识，神秘', descEn: 'Intuition, sacred knowledge, divine feminine' },
  { id: '3', name: '皇后', nameEn: 'The Empress', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg', desc: '丰饶，母性，自然', descEn: 'Femininity, beauty, nature, nurturing' },
  { id: '4', name: '皇帝', nameEn: 'The Emperor', image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg', desc: '权威，结构，控制', descEn: 'Authority, establishment, structure' },
  { id: '5', name: '教皇', nameEn: 'The Hierophant', image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg', desc: '传统，精神指引，信仰', descEn: 'Spiritual wisdom, religious beliefs, tradition' },
  { id: '6', name: '恋人', nameEn: 'The Lovers', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg', desc: '爱，和谐，关系', descEn: 'Love, harmony, relationships, choices' },
  { id: '7', name: '战车', nameEn: 'The Chariot', image: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg', desc: '胜利，意志，行动', descEn: 'Control, willpower, success, action' },
  { id: '8', name: '力量', nameEn: 'Strength', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg', desc: '勇气，耐心，控制', descEn: 'Strength, courage, persuasion, influence' },
  { id: '9', name: '隐士', nameEn: 'The Hermit', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg', desc: '内省，孤独，引导', descEn: 'Soul-searching, introspection, being alone' },
  { id: '10', name: '命运之轮', nameEn: 'Wheel of Fortune', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg', desc: '变化，周期，命运', descEn: 'Good luck, karma, life cycles, destiny' },
  { id: '11', name: '正义', nameEn: 'Justice', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg', desc: '公正，真理，法律', descEn: 'Justice, fairness, truth, cause and effect' },
  { id: '12', name: '倒吊人', nameEn: 'The Hanged Man', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg', desc: '牺牲，放手，新视角', descEn: 'Pause, surrender, letting go, new perspectives' },
  { id: '13', name: '死神', nameEn: 'Death', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg', desc: '结束，转变，重生', descEn: 'Endings, change, transformation, transition' },
  { id: '14', name: '节制', nameEn: 'Temperance', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg', desc: '平衡，适度，耐心', descEn: 'Balance, moderation, patience, purpose' },
  { id: '15', name: '恶魔', nameEn: 'The Devil', image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg', desc: '束缚，物质主义，诱惑', descEn: 'Shadow self, attachment, addiction, restriction' },
  { id: '16', name: '高塔', nameEn: 'The Tower', image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg', desc: '灾难，剧变，启示', descEn: 'Sudden change, upheaval, chaos, revelation' },
  { id: '17', name: '星星', nameEn: 'The Star', image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg', desc: '希望，灵感，宁静', descEn: 'Hope, faith, purpose, renewal, spirituality' },
  { id: '18', name: '月亮', nameEn: 'The Moon', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg', desc: '幻觉，恐惧，潜意识', descEn: 'Illusion, fear, anxiety, subconscious, intuition' },
  { id: '19', name: '太阳', nameEn: 'The Sun', image: 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg', desc: '快乐，成功，活力', descEn: 'Positivity, fun, warmth, success, vitality' },
  { id: '20', name: '审判', nameEn: 'Judgement', image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg', desc: '重生，召唤，宽恕', descEn: 'Judgement, rebirth, inner calling, absolution' },
  { id: '21', name: '世界', nameEn: 'The World', image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg', desc: '完成，整合，成就', descEn: 'Completion, integration, accomplishment, travel' },
  
  // Minor Arcana (Selection for the "Full Deck" Unlock Experience)
  { id: 'w_ace', name: '权杖王牌', nameEn: 'Ace of Wands', image: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg', desc: '创造力的源泉，新机会', descEn: 'Creation, willpower, inspiration, desire' },
  { id: 'w_10', name: '权杖十', nameEn: 'Ten of Wands', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Wands10.jpg', desc: '重担，责任，努力', descEn: 'Burden, extra responsibility, hard work' },
  { id: 'c_ace', name: '圣杯王牌', nameEn: 'Ace of Cups', image: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Cups01.jpg', desc: '情感的流动，爱，直觉', descEn: 'Love, new feelings, emotional awakening' },
  { id: 'c_2', name: '圣杯二', nameEn: 'Two of Cups', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Cups02.jpg', desc: '伙伴关系，吸引力，结合', descEn: 'Unified love, partnership, attraction' },
  { id: 's_ace', name: '宝剑王牌', nameEn: 'Ace of Swords', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Swords01.jpg', desc: '思想的突破，清晰，真理', descEn: 'Breakthrough, clarity, sharp mind' },
  { id: 's_3', name: '宝剑三', nameEn: 'Three of Swords', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Swords03.jpg', desc: '心碎，悲伤，释放', descEn: 'Heartbreak, emotional pain, sorrow' },
  { id: 'p_ace', name: '星币王牌', nameEn: 'Ace of Pentacles', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Pents01.jpg', desc: '物质的显化，繁荣，新开始', descEn: 'Opportunity, prosperity, new venture' },
  { id: 'p_9', name: '星币九', nameEn: 'Nine of Pentacles', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pents09.jpg', desc: '富足，奢华，自我依赖', descEn: 'Abundance, luxury, self-sufficiency' },
];

export const CARD_BACK_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDisTMVHQLEYtDKUnarvB8MycahwcwwTsUokbXJCGpGzN5azWyjqcR-TUH_VxA236cDNbrdzNykSAsZzbIfGYcbZqcj910wkinDc4ePuVOdm7_d7HoyZ2JkbW0m13rM-cc8DkMxDTUXBUpWFNF26hOuRZ5rGqoICxk-Jo77kYoAPoXE-9c31JshEagBeocyyzvlfhN4zUw2G3vCH8NNpKgb0G4DD5U5EikqClhNMAYDt6Hu5_LKtP2dV1RaTQKu6xH5GqPXZJcBJUMM";

// Store Items: Adjusted to match user-provided pricing table
// Base rate approx 10 coins / ¥1
// Tier 1: ¥6 -> 60 (Base 60, Bonus 0)
// Tier 2: ¥38 -> 400 (Base 380, Bonus 20)
// Tier 3: ¥88 -> 980 (Base 880, Bonus 100)
// Tier 4: ¥128 -> 1500 (Base 1280, Bonus 220)
export const STORE_ITEMS = [
  { id: '1', name: 'Stardust', nameCn: '星尘', coins: 60, bonus: 0, price: 0.99, priceCn: 6, recommend: false },
  { id: '2', name: 'Comet', nameCn: '彗星', coins: 380, bonus: 20, price: 5.99, priceCn: 38, recommend: false },
  { id: '3', name: 'Nebula', nameCn: '星云', coins: 880, bonus: 100, price: 12.99, priceCn: 88, recommend: false },
  { id: '4', name: 'Galaxy', nameCn: '星系', coins: 1280, bonus: 220, price: 19.99, priceCn: 128, recommend: false },
];
