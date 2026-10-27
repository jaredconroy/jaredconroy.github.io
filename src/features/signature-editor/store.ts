import saved from '../../content/signature-transform.json';
import {type JTransform,validTransform} from './transform';
let current:JTransform={...saved};
let persisted:JTransform={...saved};
const listeners=new Set<()=>void>();
export const getJTransform=()=>current;
export const getSavedJTransform=()=>persisted;
export const markJSaved=(value:JTransform)=>{persisted={...value};listeners.forEach(listener=>listener());};
export function previewJTransform(value:JTransform){if(!validTransform(value))return;current={...value};listeners.forEach(listener=>listener());}
export function subscribeJTransform(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
