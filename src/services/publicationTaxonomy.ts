import { TAXONOMY, taxonomyById, type DealTypeId, type TaxonomyCategory, type TaxonomyItem } from '../domain/taxonomy';
export const getTaxonomyItems=(category:TaxonomyCategory,dealType:DealTypeId):TaxonomyItem[]=>TAXONOMY.filter(item=>item.active&&item.category===category&&item.dealTypes.includes(dealType)).sort((a,b)=>a.sortOrder-b.sortOrder);
export const getTaxonomyHashtag=(id:string):string=>taxonomyById(id)?.hashtag??'';
export const getTaxonomyLabel=(id:string):string=>taxonomyById(id)?.labelRu??'Не указано';
export const uniqueHashtags=()=>new Set(TAXONOMY.map(item=>`${item.category}:${item.hashtag}`)).size===TAXONOMY.length;
