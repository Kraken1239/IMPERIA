import Storefront from './storefront';
const business={
 '@context':'https://schema.org','@type':'ClothingStore',name:'IMPERIA',
 description:'Магазин меховых изделий в Актау',
 address:{'@type':'PostalAddress',streetAddress:'28-й микрорайон, 47, ЖК Grand Avenue',addressLocality:'Актау',addressCountry:'KZ'},
 sameAs:['https://www.instagram.com/aktau_shubi_imperia/','https://2gis.kz/aktau/firm/70000001036916830'],
};
export default function Page(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(business)}}/><Storefront/></>}
