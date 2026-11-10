import React from 'react';
import LegalCompliancePortal from './LegalCompliancePortal';

export default function PrivacyPolicyModal({ isOpen, onClose }) {
  return <LegalCompliancePortal isOpen={isOpen} onClose={onClose} initialTab="privacy" />;
}
