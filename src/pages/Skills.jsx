import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { hotelSkills, HOTEL_SKILLS_SOURCE, skillSourceUrl, createSkillProject } from '../data/hotelSkills';

export default function Skills({ favorites = [], onToggleFavorite, onCreateProject, busy = false }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const categories = [...new Set(hotelSkills.map(skill => skill.category))];
  const term = query.trim().toLowerCase();
  const visible = hotelSkills.filter(skill =>
    (category === 'All categories' || skill.category === category) &&
    (!savedOnly || favorites.includes(skill.id)) &&
    `${skill.title} ${skill.summary} ${skill.inputs.join(' ')}`.toLowerCase().includes(term)
  );

  return <>
    <div className="page-heading skills-heading"><div><span className="eyebrow">HOTEL INTELLIGENCE, IN YOUR WORKSPACE</span><h1>Skills</h1><p>A starting point for better hotel decisions.</p></div>
      <a className="button secondary" href={HOTEL_SKILLS_SOURCE.repository} target="_blank" rel="noreferrer">View source <Icon name="out" size={14}/></a>
    </div>
    <section className="skills-intro"><span className="symbol purple"><Icon name="star" size={25}/></span><div><h2>Hotel Intelligence Suite <span className="badge purple">10 workflows</span></h2><p>Explore HospitalityOS workflows, save your favorites, and prepare a project brief with your property’s goals.</p></div></section>
    <div className="skills-toolbar">
      <label className="search-input"><Icon name="search" size={16}/><input aria-label="Search skills" placeholder="Search hotel skills…" value={query} onChange={event => setQuery(event.target.value)}/></label>
      <label className="skills-category"><span className="sr-only">Skill category</span><select aria-label="Skill category" value={category} onChange={event => setCategory(event.target.value)}><option>All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
      <button className={'button saved-skills '+(savedOnly?'saved-active':'secondary')} aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}><Icon name="star" size={14}/>Saved <span>{favorites.length}</span></button>
    </div>
    <div className="skills-results" role="status">Showing {visible.length} of {hotelSkills.length} skills <span>Workflow templates · by HospitalityOS</span></div>
    <div className="skills-grid">{visible.map(skill => <article className="skill-card" key={skill.id}>
      <div className="skill-card-heading"><span className={'symbol '+skill.color}><Icon name={skill.icon} size={20}/></span><button className={'icon-button favorite-skill '+(favorites.includes(skill.id)?'is-saved':'')} aria-label={favorites.includes(skill.id)?`Remove ${skill.title} from saved skills`:`Save ${skill.title}`} aria-pressed={favorites.includes(skill.id)} disabled={busy} onClick={() => onToggleFavorite(skill.id)}><Icon name="star" size={17} fill={favorites.includes(skill.id)?'currentColor':'none'}/></button></div>
      <span className="eyebrow">{skill.category}</span><h2>{skill.title}</h2><p>{skill.summary}</p><div className="skill-inputs">{skill.inputs.slice(0,2).map(input => <span key={input}>{input}</span>)}</div>
      <footer><button className="button secondary" onClick={() => setSelected(skill)}>Create brief <Icon name="arrow" size={14}/></button><a href={skillSourceUrl(skill)} target="_blank" rel="noreferrer" aria-label={`Open original guide for ${skill.title}`}>Guide <Icon name="out" size={14}/></a></footer>
    </article>)}</div>
    {!visible.length && <section className="empty-skills"><span className="symbol purple"><Icon name="search" size={23}/></span><h2>{savedOnly?'No saved skills match yet.':'No matching skills.'}</h2><p>{savedOnly?'Star a workflow to keep it close, or change your filters.':'Try another search or category.'}</p><button className="button secondary" onClick={() => {setQuery('');setCategory('All categories');setSavedOnly(false);}}>Show all skills</button></section>}
    <p className="skills-attribution">Original guides are maintained by <a href={HOTEL_SKILLS_SOURCE.repository} target="_blank" rel="noreferrer">HospitalityOS <Icon name="out" size={11}/></a>. Creating a brief saves a project; it does not run an AI analysis or connect hotel systems. See the source repository for usage terms.</p>
    {selected && <SkillBrief skill={selected} busy={busy} onClose={() => setSelected(null)} onCreateProject={onCreateProject}/>}
  </>;
}

function SkillBrief({ skill, busy, onClose, onCreateProject }) {
  const [property, setProperty] = useState('');
  const [objective, setObjective] = useState('');
  const [context, setContext] = useState('');
  const [error, setError] = useState('');
  const dialog = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.querySelector('input')?.focus();
    const keydown = event => {
      if (event.key === 'Escape' && !busy) { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const items = [...dialog.current.querySelectorAll('button:not([disabled]), input, textarea, a[href]')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [busy, onClose]);

  const create = async event => {
    event.preventDefault(); setError('');
    try {
      const project = createSkillProject(skill, { property, objective, context });
      if (await onCreateProject(project)) { onClose(); navigate('/projects'); }
      else setError('Could not save the brief. Your entries are still here; please try again.');
    } catch (error) { setError(error.message); }
  };
  return <div className="modal-backdrop" onClick={event => {if(event.target===event.currentTarget&&!busy)onClose();}}><section ref={dialog} className="modal skill-brief-modal" role="dialog" aria-modal="true" aria-labelledby="skill-brief-title">
    <div className="modal-heading"><h2 id="skill-brief-title">{skill.title}</h2><button className="icon-button" aria-label="Close brief" disabled={busy} onClick={onClose}><Icon name="close"/></button></div>
    <p className="section-note">Prepare a brief for your property. It becomes a project you can edit, copy, and use with the original workflow guide.</p>
    <div className="brief-deliverables"><strong>Suggested outputs</strong><ul>{skill.outputs.map(output => <li key={output}>{output}</li>)}</ul></div>
    <form onSubmit={create}>
      <label>Property name<input required maxLength={100} value={property} onChange={event => setProperty(event.target.value)} placeholder="Your hotel or property" disabled={busy}/></label>
      <label>What do you want to achieve?<textarea required maxLength={2000} value={objective} onChange={event => setObjective(event.target.value)} placeholder="Describe the question or decision you’re working on." disabled={busy}/></label>
      <label>Available data and context (optional)<textarea maxLength={5000} value={context} onChange={event => setContext(event.target.value)} placeholder="For example: booking pace, last month’s results, or department priorities. Add context without guest or staff personal details." disabled={busy}/></label>
      {error && <p role="alert" className="error-message">{error}</p>}
      <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose} disabled={busy}>Cancel</button><button className="button primary" disabled={busy}>{busy?'Saving…':'Save project brief'}<Icon name="arrow" size={14}/></button></div>
    </form>
  </section></div>;
}
