// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import Skills from '../src/pages/Skills';
import {hotelSkills,skillSourceUrl,createSkillProject} from '../src/data/hotelSkills';

afterEach(cleanup);
function setup(props={}){
 const onToggleFavorite=vi.fn(),onCreateProject=vi.fn().mockResolvedValue(true);
 render(<MemoryRouter initialEntries={['/skills']}><Routes><Route path="/skills" element={<Skills favorites={[]} onToggleFavorite={onToggleFavorite} onCreateProject={onCreateProject} {...props}/>}/><Route path="/projects" element={<h1>Project list</h1>}/></Routes></MemoryRouter>);
 return {onToggleFavorite,onCreateProject};
}
it('catalogs all ten workflows with valid pinned source links',()=>{
 expect(hotelSkills).toHaveLength(10);expect(new Set(hotelSkills.map(s=>s.id)).size).toBe(10);
 for(const skill of hotelSkills){const url=new URL(skillSourceUrl(skill));expect(url.origin).toBe('https://github.com');expect(url.pathname).toContain('/hospitalityos/hotel-ai-skills/blob/4e6142e72ad37088e0d3a06ccac69baea69dbb01/');expect(url.pathname.endsWith(`/${skill.id}/SKILL.md`)).toBe(true);expect(skill.outputs.length).toBeGreaterThan(0);}
});
it('filters by task and category without needing a network connection',()=>{
 setup();expect(screen.getAllByRole('button',{name:/Create brief/})).toHaveLength(10);
 fireEvent.change(screen.getByLabelText('Search skills'),{target:{value:'staffing'}});
 expect(screen.getByRole('heading',{name:'Labor Optimization'})).toBeTruthy();expect(screen.getAllByRole('button',{name:/Create brief/})).toHaveLength(1);
 fireEvent.change(screen.getByLabelText('Skill category'),{target:{value:'Revenue & finance'}});
 expect(screen.getByRole('heading',{name:'No matching skills.'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Show all skills'}));expect(screen.getAllByRole('button',{name:/Create brief/})).toHaveLength(10);
});
it('filters saved workflows and requests a favorite change for the selected skill',()=>{
 const toggle=vi.fn();setup({favorites:['owner-reporting'],onToggleFavorite:toggle});
 fireEvent.click(screen.getByRole('button',{name:/Saved 1/}));
 expect(screen.getByRole('heading',{name:'Owner Reporting'})).toBeTruthy();expect(screen.queryByRole('heading',{name:'Revenue Management'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Remove Owner Reporting from saved skills'}));expect(toggle).toHaveBeenCalledWith('owner-reporting');
});
it('offers an empty saved view without inventing installed or running skills',()=>{
 setup();fireEvent.click(screen.getByRole('button',{name:/Saved 0/}));expect(screen.getByRole('heading',{name:'No saved skills match yet.'})).toBeTruthy();expect(screen.getByText(/does not run an AI analysis/)).toBeTruthy();
});
it('creates a project brief containing property context and the original source',async()=>{
 const {onCreateProject}=setup();fireEvent.click(screen.getAllByRole('button',{name:/Create brief/})[0]);
 fireEvent.change(screen.getByLabelText('Property name'),{target:{value:' Marina Hotel '}});
 fireEvent.change(screen.getByLabelText('What do you want to achieve?'),{target:{value:'Review next month’s pricing'}});
 fireEvent.change(screen.getByLabelText('Available data and context (optional)'),{target:{value:'Current booking pace and room rates'}});
 fireEvent.click(screen.getByRole('button',{name:/Save project brief/}));
 await waitFor(()=>expect(onCreateProject).toHaveBeenCalledWith(expect.objectContaining({name:'Marina Hotel · Revenue Management',skillId:'revenue-management',status:'Planning',progress:0,category:'Hotel operations'})));
 const project=onCreateProject.mock.calls[0][0];expect(project.brief).toContain('Current booking pace and room rates');expect(project.brief).toContain(skillSourceUrl(hotelSkills[0]));expect(project.brief).toContain('not a completed AI analysis');expect(await screen.findByRole('heading',{name:'Project list'})).toBeTruthy();
});
it('retains entered information when saving a brief fails and supports retry',async()=>{
 const create=vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);setup({onCreateProject:create});fireEvent.click(screen.getAllByRole('button',{name:/Create brief/})[0]);
 fireEvent.change(screen.getByLabelText('Property name'),{target:{value:'Marina Hotel'}});fireEvent.change(screen.getByLabelText('What do you want to achieve?'),{target:{value:'Review rates'}});fireEvent.click(screen.getByRole('button',{name:/Save project brief/}));
 expect(await screen.findByRole('alert')).toBeTruthy();expect(screen.getByLabelText('Property name').value).toBe('Marina Hotel');
 fireEvent.click(screen.getByRole('button',{name:/Save project brief/}));expect(await screen.findByRole('heading',{name:'Project list'})).toBeTruthy();expect(create).toHaveBeenCalledTimes(2);
});
it('closes a brief with Escape without saving a project',()=>{
 const {onCreateProject}=setup();fireEvent.click(screen.getAllByRole('button',{name:/Create brief/})[0]);expect(screen.getByRole('dialog')).toBeTruthy();fireEvent.keyDown(document,{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();expect(onCreateProject).not.toHaveBeenCalled();
});
it('rejects blank property or objective values before generating a project',()=>{
 expect(()=>createSkillProject(hotelSkills[0],{property:'  ',objective:'A goal',context:''})).toThrow('property name');expect(()=>createSkillProject(hotelSkills[0],{property:'Hotel',objective:' ',context:''})).toThrow('goal');
});
it('keeps project fields bounded while preserving the full context in the brief',()=>{
 const project=createSkillProject(hotelSkills[0],{property:'Hotel '.repeat(20),objective:'A'.repeat(1000),context:''});expect(project.name.length).toBeLessThanOrEqual(80);expect(project.description).toHaveLength(300);expect(project.brief).toContain('A'.repeat(1000));expect(project.brief).toContain('Request the required hotel data');
});
