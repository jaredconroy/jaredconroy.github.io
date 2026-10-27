import type {DesignArtwork} from '../../content/design';

export type RecordSleeve={id:string;artworks:DesignArtwork[]};

/** Full synchronized loops, offset by half the artwork and never splitting a sleeve. */
export function recordRows(items:DesignArtwork[]):RecordSleeve[][]{
 const records:RecordSleeve[]=[];
 for(const artwork of items){
  const id=artwork.sleeve?.id||artwork.src;
  const existing=artwork.sleeve&&records.find(record=>record.id===id);
  if(existing)existing.artworks.push(artwork);
  else records.push({id,artworks:[artwork]});
 }
 for(const record of records)record.artworks.sort((a,b)=>Number(a.sleeve?.side==='front')-Number(b.sleeve?.side==='front'));
 const target=Math.ceil(items.length/2);
 let split=0,count=0;
 while(split<records.length&&(count+records[split].artworks.length<=target||split===0))count+=records[split++].artworks.length;
 if(records.length<2)return records.length?[records]:[];
 return [records,[...records.slice(split),...records.slice(0,split)]];
}
