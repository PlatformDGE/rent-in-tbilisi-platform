import { describe,expect,it } from 'vitest';
import { EMPTY_PROPERTY_INPUT,type Property } from '../domain/property';
import { buildPublicationText } from './buildPublicationText';
const p=(over:Partial<Property>={}):Property=>({...EMPTY_PROPERTY_INPUT,id:'1',internalId:'T',createdAt:'x',updatedAt:'x',history:[],districtId:'district.Saburtalo',metroId:'metro.TCUniversity',address:'60 Mikheil Burdzgla St',bedroomsId:'bedrooms.1Bed',propertyTypeId:'propertyType.Apartment',buildingTypeId:'buildingType.NewBuilding',designId:'design.Mixed',area:60,floor:3,totalFloors:8,bathrooms:1,amenityIds:['amenity.CentralHeating','amenity.Shower','amenity.Stove','amenity.Oven','amenity.Conditioner','amenity.WiFi','amenity.Balcony','amenity.Elevator'],balconyCount:2,price:500,deposit:500,maxTenants:2,petId:'pets.ByAgreement',rentalPeriodIds:['rentalPeriod.6Month','rentalPeriod.12Month'],agentHashtag:'Omar',...over});
const rent=`#Saburtalo 🚇 #TCUniversity
📍 60 Mikheil Burdzgla St

🏢 #1Bed #Apartment for #Rent
✨ #NewBuilding | #Mixed
🏠 60 Sq.m | 3/8 Floor |
#CentralHeating | #Shower

✅ #Stove ✅ #Oven
✅ #Conditioner ✅ #WiFi
✅ #Balcony (2) ✅ #Elevator

✖️ Dishwasher ✖️ TV
✖️ Parking Place

💰 $500 + Deposit $500
0% Commission
#Price300to500
#Price500to700

👬 Tenants: 1-2
🐕 Pets: #ByAgreement
🕐 #6Month #12Month

📲 @David_Tibelashvili |
+995 599 20 67 16 #Omar

📍 APARTMENTS ON MAP 📍`;
describe('аренда',()=>{it('полный пост',()=>expect(buildPublicationText(p())).toBe(rent));it('без метро',()=>expect(buildPublicationText(p({metroId:''}))).not.toContain('🚇'));it('граничная цена',()=>expect(buildPublicationText(p())).toContain('#Price300to500\n#Price500to700'));it('один и два балкона',()=>{expect(buildPublicationText(p({balconyCount:1}))).toContain('✅ #Balcony');expect(buildPublicationText(p({balconyCount:2}))).toContain('#Balcony (2)')});it('несколько периодов',()=>expect(buildPublicationText(p())).toContain('🕐 #6Month #12Month'));it('нет хэштега агента',()=>expect(buildPublicationText(p({agentHashtag:''}))).toContain('#???'));it('отрицательные удобства',()=>expect(buildPublicationText(p({amenityIds:[]}))).toContain('✖️ Dishwasher ✖️ TV\n✖️ Parking Place ✖️ Elevator\n✖️ Oven ✖️ Conditioner'))});
describe('продажа',()=>{const sale=(o:Partial<Property>={})=>p({dealType:'sale',districtId:'district.Vake',metroId:'metro.Rustaveli',address:'10 Example St',bedroomsId:'bedrooms.2Bed',propertyTypeId:'',residentialSubtypeId:'',commercialTypeId:'propertyType.Apartment',designId:'design.NewApartment',conditionId:'condition.FullyRenovated',area:90,floor:5,totalFloors:12,amenityIds:['amenity.Balcony','amenity.ParkingPlace','amenity.CentralHeating','amenity.Elevator'],price:180000,deposit:null,maxTenants:null,petId:'',rentalPeriodIds:[],...o});it('полный пост без rental-полей',()=>{const text=buildPublicationText(sale());expect(text).toContain('#2Bed #Apartment for #Sale');expect(text).toContain('🛠️ #FullyRenovated');expect(text).toContain('#Price150000to180000\n#Price180000to210000');expect(text).not.toMatch(/Deposit|Commission|Tenants|Pets/)});it.each([['дом','residentialSubtype.House','#House'],['земля','residentialSubtype.Land','#Land'],['коммерция','commercialType.Commercial','#Commercial']])('%s',(_,id,tag)=>expect(buildPublicationText(sale({commercialTypeId:id.startsWith('commercial')?id:'',residentialSubtypeId:id.startsWith('residential')?id:''}))).toContain(tag));it('квартира',()=>expect(buildPublicationText(sale())).toContain('#Apartment'));it('без метро',()=>expect(buildPublicationText(sale({metroId:''}))).not.toContain('🚇'));it('без агента',()=>expect(buildPublicationText(sale({agentHashtag:''}))).toContain('#???'));it('стандартные контакты',()=>expect(buildPublicationText(sale({agentHashtag:'Nika'}))).toContain('@David_Tibelashvili |\n+995 599 20 67 16 #Nika'))});
