import {cp,readdir,rm} from 'node:fs/promises';
await rm('assets',{recursive:true,force:true});for(const name of await readdir('dist'))await cp('dist/'+name,name,{recursive:true});console.log('GitHub Pages root files prepared. Edit app.html and src/.');
