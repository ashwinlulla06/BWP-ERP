import React from 'react';
import Icon from './Icon';
import { USE_MOCK } from '../lib/equipmentApi';
 
// Shown only while the pages run on demo data.
export default function MockBanner() {
  if (!USE_MOCK) return null;
  return (
    <div className="eq-mockbanner" role="note">
      <Icon name="science" size={18} />
      <span>
        Showing demo data. Set <code>REACT_APP_USE_MOCK=false</code> in <code>client/.env</code> once the backend is running.
      </span>
    </div>
  );
}