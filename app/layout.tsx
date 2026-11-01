import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 metadataBase:new URL(process.env.APP_ORIGIN||process.env.RENDER_EXTERNAL_URL||'https://imperia-aktau-boutique.deepmica1.chatgpt.site'),
 title:'IMPERIA — меховой бутик в Актау',
 description:'Шубы, дублёнки и жилеты в IMPERIA. Персональный подбор и примерка в бутике: Актау, 28-й микрорайон, 47, ЖК Grand Avenue. Заявка онлайн, оплата после подтверждения.',
 icons:{icon:'/favicon.svg'},
 openGraph:{title:'IMPERIA — искусство быть собой',description:'Меховой бутик в Актау. Найдите свой особенный образ.',locale:'ru_KZ',type:'website',images:['/images/hero.webp']},
};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ru"><body>{children}</body></html>}
