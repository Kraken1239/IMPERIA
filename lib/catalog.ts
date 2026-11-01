export type Product = {
  id: string; name: string; category: 'fur' | 'shearling' | 'vest'; material: string;
  color: string; colorHex: string; image: string; sizes: string[]; price: number | null;
  description: string; badge: string; demo: boolean; active: boolean;
};
export const categories = { all: 'Все модели', fur: 'Шубы', shearling: 'Дублёнки', vest: 'Жилеты' };
export const samples: Product[] = [
  { id:'pearl', name:'Жемчужное утро', category:'fur', material:'Светлая палитра', color:'Жемчуг',colorHex:'#dcd4c5', image:'/images/pearl.webp', sizes:['42','44','46','48'],price:null,description:'Светлый оттенок, объёмный воротник и мягкая линия плеч. Покажите этот образ консультанту — поможем найти похожую модель в бутике.',badge:'Светлая палитра',demo:true,active:true },
  { id:'espresso', name:'Тёмный шоколад', category:'fur', material:'Тёмная палитра', color:'Шоколад',colorHex:'#48352a',image:'/images/espresso.webp',sizes:['44','46','48','50'],price:null,description:'Глубокий шоколадный оттенок и свободный силуэт. Ориентир для персонального подбора: материал, размеры и наличие уточнит консультант.',badge:'Выбор редакции',demo:true,active:true },
  { id:'camel',name:'Тёплый карамель',category:'shearling',material:'Дублёнки',color:'Карамель',colorHex:'#b58c61',image:'/images/shearling.webp',sizes:['42','44','46','48','50'],price:null,description:'Карамельный оттенок и светлая отделка. Соберём для вас подборку дублёнок в похожем стиле из актуального ассортимента.',badge:'На каждый день',demo:true,active:true },
];
export const money = (n: number) => new Intl.NumberFormat('ru-KZ').format(n) + ' ₸';
export const WHATSAPP = '77016668730';
export const INSTAGRAM = 'https://www.instagram.com/aktau_shubi_imperia/';
export const MAP = 'https://2gis.kz/aktau/firm/70000001036916830';
export function whatsapp(text: string) { return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`; }
