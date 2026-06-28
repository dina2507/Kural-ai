import { InfoWindow } from '@vis.gl/react-google-maps';
import { Issue } from '../../issues/types/issue.types';
import { Link } from 'react-router-dom';

export function IssueInfoWindow({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  return (
    <InfoWindow
      position={{ lat: issue.latitude, lng: issue.longitude }}
      onCloseClick={onClose}
      headerDisabled={true}
      className="!p-0 !bg-transparent"
    >
      <div className="bg-bg-surface p-4 rounded-xl border border-border shadow-xl max-w-[280px] text-left">
        <div className="flex gap-2 mb-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-subtle text-primary">
            {issue.category.replace('_', ' ')}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${issue.severity >= 8 ? 'bg-danger-subtle text-danger' : issue.severity >= 5 ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
            Sev {issue.severity}
          </span>
        </div>
        
        <h4 className="font-bold text-text-primary text-sm mb-1 line-clamp-2 leading-tight">
          {issue.title}
        </h4>
        <p className="text-xs text-text-secondary truncate mb-3">{issue.address || 'Address not available'}</p>
        
        <div className="flex justify-between items-center text-xs">
           <span className="text-text-tertiary">{new Date(issue.createdAt).toLocaleDateString()}</span>
           <Link to={`/issue/${issue.id}`} className="text-primary font-medium hover:underline">
             View Details &rarr;
           </Link>
        </div>
      </div>
    </InfoWindow>
  );
}
