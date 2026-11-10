import React from 'react';
import LegalCompliancePortal from './LegalCompliancePortal';

export default function TermsModal({ isOpen, onClose }) {
  return <LegalCompliancePortal isOpen={isOpen} onClose={onClose} initialTab="terms" />;
}
