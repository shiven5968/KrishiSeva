import React from 'react';
import LegalCompliancePortal from './LegalCompliancePortal';

export default function ContactUsModal({ isOpen, onClose }) {
  return <LegalCompliancePortal isOpen={isOpen} onClose={onClose} initialTab="contact" />;
}
