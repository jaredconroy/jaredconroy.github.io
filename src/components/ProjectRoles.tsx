import type {Project} from '../content/projects';

/** Show the full set of disciplines for a project, with the canonical pair first. */
export function ProjectRoles({project}:{project:Project}){
 const roles=[...project.roles,...project.expandedRoles];
 return <div class="project-role-list" aria-label="Project roles">
  <span class="eyebrow">Jared's Roles:</span>
  <ul>{roles.map(role=><li key={role}>{role}</li>)}</ul>
 </div>;
}
