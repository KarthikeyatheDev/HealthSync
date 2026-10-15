import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Database, Shield, Cpu, Activity, CheckCircle2 } from 'lucide-react';
import { HospitalSite } from '../../types';
import { getSettings } from '../../lib/api';

interface HospitalsViewProps {
  sites: HospitalSite[];
}

export const HospitalsView: React.FC<HospitalsViewProps> = ({ sites }) => {
  const [networkSettings, setNetworkSettings] = useState<any>(null);

  useEffect(() => {
    getSettings()
      .then((cfg) => setNetworkSettings(cfg))
      .catch((err) => console.warn('Could not load settings in HospitalsView:', err));
  }, []);
  const hospitalDetails = [
    {
      id: 'hospital_a',
      name: 'Hospital North (Hospital 1)',
      location: 'Hyderabad, Telangana',
      facility: 'Community & Metabolic Clinic',
      ehr: 'Epic Systems / FHIR R4',
      cohort: 'Younger metabolic cohort (Diabetes labeled, CVD unobserved)',
      records: 42868,
      activeModel: 'hospital_1.pth',
      privacyBudget: 'ε = 1.2 (Local DP active)',
      lastSync: 'Ready for training (v1.0.0)',
      features: 'MIMIC-IV Cardiometabolic Schema (12 Features)',
      color: 'teal'
    },
    {
      id: 'hospital_b',
      name: 'Hospital Central (Hospital 2)',
      location: 'New Delhi, NCR',
      facility: 'Cardiology & Vascular Institute',
      ehr: 'Cerner Millennium / HL7 v2',
      cohort: 'Cardiology cohort (CVD labeled, Diabetes unobserved)',
      records: 42868,
      activeModel: 'hospital_2.pth',
      privacyBudget: 'ε = 1.0 (Local DP active)',
      lastSync: 'Ready for training (v1.0.0)',
      features: 'MIMIC-IV Cardiometabolic Schema (12 Features)',
      color: 'blue'
    },
    {
      id: 'hospital_c',
      name: 'Hospital South (Hospital 3)',
      location: 'Chennai, Tamil Nadu',
      facility: 'Multi-Morbid Tertiary Referral Hospital',
      ehr: 'Allscripts / OpenEHR',
      cohort: 'Multi-morbid referral cohort (Both labels observed)',
      records: 42868,
      activeModel: 'hospital_3.pth',
      privacyBudget: 'ε = 1.5 (Local DP active)',
      lastSync: 'Ready for training (v1.0.0)',
      features: 'MIMIC-IV Cardiometabolic Schema (12 Features)',
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#24332e] tracking-tight">Participating Hospitals & Clients</h1>
        <p className="text-xs text-[#6c7771] mt-1">
          Detailed telemetry for simulated hospital nodes participating in the federated learning network.
        </p>
      </div>

      {/* Grid of Hospital Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {hospitalDetails.map((h, idx) => {
          const liveSite = sites.find(s => s.id === h.id);
          const borderColor = idx === 0 ? 'border-teal-200' : idx === 1 ? 'border-blue-200' : 'border-purple-200';
          const badgeColor = idx === 0 ? 'bg-teal-100 text-teal-800' : idx === 1 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';

          return (
            <div key={h.id} className={`clinical-card p-6 border ${borderColor} flex flex-col justify-between`}>
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#24332e]">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#24332e]">{h.name}</h2>
                      <div className="flex items-center text-[11px] text-[#6c7771] mt-0.5">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{h.location}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {liveSite?.status === 'training' ? 'Training...' : 'Online & Ready'}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#6c7771]">Clinical Facility</span>
                    <span className="font-medium text-[#24332e] text-right">{h.facility}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#6c7771]">EHR Integration</span>
                    <span className="font-mono text-[11px] text-slate-700">{h.ehr}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#6c7771]">Local Patient Records</span>
                    <span className="font-bold text-[#24332e]">{h.records.toLocaleString()} records</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#6c7771]">Local Model Artifact</span>
                    <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{h.activeModel}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 items-center">
                    <span className="text-[#6c7771]">Privacy Boundary</span>
                    {networkSettings && networkSettings.differentialPrivacy === false ? (
                      <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                        DP Inactive (Raw Weights)
                      </span>
                    ) : (
                      <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                        ε = {networkSettings?.epsilon || '1.2'} (Local DP active)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#6c7771]">Network Weight: <strong>{((h.records / 128604) * 100).toFixed(1)}%</strong></span>
                <span className="inline-flex items-center text-emerald-600 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Connected
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
