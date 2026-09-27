let backupBusy=false;
function fileDataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Could not read a photo for backup.'));reader.readAsDataURL(blob);});}
async function buildBackup() {
  if(busyPhotoTrips.size)throw new Error('Wait for your photos to finish saving, then try again.');
  const trips=structuredClone(state.trips.filter(t=>t.own));
  const ids=new Set(trips.map(t=>t.id));
  const records=(await photoTransaction('readonly',store=>store.getAll())).filter(p=>ids.has(p.tripId));
  const photos=[];
  for(const p of records)photos.push({tripId:p.tripId,name:p.name,caption:p.caption,created:p.created,data:await fileDataURL(p.blob)});
  return {format:'roam-travel-backup',version:1,created:new Date().toISOString(),trips,visited:[...state.visited],photos};
}
function validateBackup(data) {
  const fail=()=>{throw new Error('This is not a valid Roam travel backup. Nothing has been changed.');};
  const str=(x,max=10000)=>{if(typeof x!=='string'||x.length>max)fail();return x;};
  const arr=(x,max)=>{if(!Array.isArray(x)||x.length>max)fail();return x;};
  const number=(x,min,max)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)fail();return x;};
  const id=x=>{if(!/^[a-zA-Z0-9_-]{1,100}$/.test(str(x,100)))fail();return x;};
  const date=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(str(x,10)))fail();return x;};
  if(!data||data.format!=='roam-travel-backup'||data.version!==1)fail();
  const trips=arr(data.trips,100).map(t=>{
    if(!t||t.own!==true)fail();
    const copy={id:id(t.id),title:str(t.title,200),place:str(t.place,200),author:str(t.author,100),days:number(t.days,1,365),own:true,status:str(t.status,20),image:str(t.image,100),stops:[]};
    if(!Number.isInteger(copy.days)||!['Draft','Planned','Ongoing','Completed','Archived'].includes(copy.status))fail();
    copy.stops=arr(t.stops,2000).map(s=>{
      const stop={name:str(s.name,200),done:s.done===true};
      if(s.day!==undefined){stop.day=number(s.day,0,365);if(!Number.isInteger(stop.day))fail();}
      for(const k of ['time','note','transport','cost'])if(s[k]!==undefined)stop[k]=str(s[k]);
      if(s.notes!==undefined)stop.notes=arr(s.notes,100).map(n=>str(n));
      return stop;
    });
    if(t.story!==undefined)copy.story=str(t.story);
    if(t.journal!==undefined)copy.journal=str(t.journal);
    if(t.imported===true){
      Object.assign(copy,{imported:true,visibility:'private',departureDate:date(t.departureDate),endDate:date(t.endDate),timezone:'Asia/Shanghai'});
      copy.schedule=arr(t.schedule,366).map(d=>({day:number(d.day,0,365),date:date(d.date),title:str(d.title,200),estimate:str(d.estimate||''),stay:str(d.stay||'')}));
      for(const key of ['transport','hotels'])copy[key]=arr(t[key],500).map(v=>({name:str(v.name),route:str(v.route),day:str(v.day),time:str(v.time)}));
      copy.expenses=arr(t.expenses,5000).map(v=>({date:date(v.date),name:str(v.name),category:str(v.category),paid:str(v.paid),sgd:number(v.sgd,0,100000000)}));
    }
    return copy;
  });
  const ids=new Set(trips.map(t=>t.id));if(ids.size!==trips.length)fail();
  const visited=arr(data.visited,300).map(v=>{if(!/^[A-Z]{3}$/.test(str(v,3)))fail();return v;});
  const photos=arr(data.photos,1000).map(p=>{
    if(!p||!ids.has(p.tripId)||typeof p.data!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p.data)||p.data.length>10000000)fail();
    return {tripId:p.tripId,name:str(p.name,1000),caption:str(p.caption,180),created:number(p.created,0,1e15),data:p.data};
  });
  return {trips,visited,photos};
}
async function writePhotoBatch(records,remove=false){
  const db=await openPhotoDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('photos','readwrite');const store=tx.objectStore('photos');
    for(const record of records)remove?store.delete(record.id):store.put(record);
    tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(new Error('Could not restore photos. Browser storage may be full.'));
  });
}
async function restoreBackup(data) {
  if(busyPhotoTrips.size)throw new Error('Wait for photos to finish saving before restoring.');
  const valid=validateBackup(data),mapping=new Map(valid.trips.map(t=>[t.id,newTripId()]));
  const records=[];
  for(const p of valid.photos){
    const binary=atob(p.data.split(',')[1]),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    const blob=new Blob([bytes],{type:'image/jpeg'});
    const bitmap=await createImageBitmap(blob).catch(()=>{throw new Error('A backup photo is damaged. Nothing has been restored.');});bitmap.close();
    records.push({id:newTripId(),tripId:mapping.get(p.tripId),name:p.name,caption:p.caption,created:p.created,blob});
  }
  const next=structuredClone(state);
  for(const t of valid.trips)next.trips.push({...t,id:mapping.get(t.id),title:t.title+' — restored'});
  next.visited=[...new Set([...next.visited,...valid.visited])];
  await writePhotoBatch(records);
  try{localStorage.setItem('roam-prototype-v1',JSON.stringify(next));state=next;}
  catch(error){await writePhotoBatch(records,true);throw new Error('Trip storage is full. Restore cancelled; current trips are unchanged.');}
  return {trips:valid.trips.length,photos:records.length};
}
document.addEventListener('click',async e=>{
  if(e.target.id!=='export-backup'||backupBusy)return;
  backupBusy=true;e.target.disabled=true;
  try{
    const backup=await buildBackup();const text=JSON.stringify(backup);if(text.length>100*1024*1024)throw new Error('Backup exceeds 100 MB. Reduce the photo collection before exporting.');
    const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`roam-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
    const feedback=$('#backup-feedback');if(feedback)feedback.textContent=`Backup download started: ${backup.trips.length} trips and ${backup.photos.length} photos. Check your Downloads or Files app.`;
  }catch(error){notify(error.message);}finally{backupBusy=false;e.target.disabled=false;}
});
document.addEventListener('change',async e=>{
  if(e.target.id!=='import-backup'||backupBusy)return;
  const file=e.target.files[0];if(!file)return;backupBusy=true;e.target.disabled=true;
  try{
    if(file.size>100*1024*1024)throw new Error('Choose a Roam backup smaller than 100 MB.');
    const data=JSON.parse(await file.text());const result=await restoreBackup(data);
    const feedback=$('#backup-feedback');if(feedback)feedback.textContent=`Restored ${result.trips} trip copies and ${result.photos} photos. Open My trips to find them.`;
    notify('Backup restored. Your existing trips are unchanged.');
  }catch(error){notify(error instanceof SyntaxError?'This file is not a valid JSON backup.':error.message);}
  finally{backupBusy=false;e.target.disabled=false;e.target.value='';}
});
