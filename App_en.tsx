import React, { useState, useRef } from 'react';
import { SOCIAL_MEDIA_VIDEOS } from './constants';
import { Apartment, ApartmentStatus, ApartmentType, type Branch, type NewBooking } from './types';
import Header from './components/Header';
import ApartmentTable from './components/ApartmentTable';
import MarketingCampaigns from './components/MarketingCampaigns';
import BranchComparisonChart from './components/BranchComparisonChart';
import BookingSourceChart from './components/BookingSourceChart';
import AddBookingModal from './components/AddBookingModal';
import { PlusIcon, UploadIcon } from './components/Icons';
import { FadeInUp } from './components/AnimatedWrappers';
import { Section, Metric } from './components/DashboardComponents';


const App_en: React.FC<{ 
  onToggleLanguage: () => void;
  branches: Branch[];
  onAddBooking: (booking: NewBooking) => void;
  onUpdateApartments: (branchId: string, apartments: Apartment[]) => void;
}> = ({ onToggleLanguage, branches, onAddBooking, onUpdateApartments }) => {
  const [visibleTable, setVisibleTable] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTable = (branchId: string) => {
    setVisibleTable(visibleTable === branchId ? null : branchId);
  };

  const totalTargetYearlyRevenue = branches.reduce((total, branch) => {
    total.min += branch.targetYearlyRevenue.min;
    total.max += branch.targetYearlyRevenue.max;
    return total;
  }, { min: 0, max: 0 });

  const totalCashCollected = branches.reduce((total, branch) => {
    const branchCash = branch.apartments.reduce((sum, apt) => sum + apt.cashCollected, 0);
    return total + branchCash;
  }, 0);

  const totalLifetimeValue = branches.reduce((total, branch) => {
    const branchLTV = branch.apartments.reduce((sum, apt) => sum + (apt.lifetimeValue || 0), 0);
    return total + branchLTV;
  }, 0);

  const formatCurrency = (value: number) => {
    return `SAR ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const chartData = branches.map(branch => ({
    name: branch.name,
    'Cash Collected': branch.apartments.reduce((sum, apt) => sum + apt.cashCollected, 0),
    'Target Revenue': branch.targetYearlyRevenue.max,
  }));
  
  const getSourceCategory = (source: string): string => {
    const cleanedSource = source.toLowerCase();
    if (cleanedSource.includes('bayut') || cleanedSource.includes('aqar') || cleanedSource.includes('listing')) {
      return 'Listing Platforms';
    }
    if (cleanedSource.includes('social') || cleanedSource.includes('facebook') || cleanedSource.includes('instagram') || cleanedSource.includes('tiktok')) {
      return 'Paid Social Advertising';
    }
    if (cleanedSource.includes('word of mouth')) {
      return 'Word of Mouth';
    }
    if (cleanedSource.includes('walk in') || cleanedSource.includes('building board')) {
      return 'Walk in';
    }
    return 'Other';
  };

  const bookingSourceData = branches.flatMap(branch => branch.apartments)
    .filter(apt => apt.status === 'RENTED' && apt.howHeard)
    .reduce((acc, apt) => {
        const category = getSourceCategory(apt.howHeard!);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

  const bookingSourceChartData = Object.entries(bookingSourceData).map(([name, value]) => ({
      name,
      value,
  }));

  const handleSubmitBooking = (booking: NewBooking) => {
    onAddBooking(booking);
    setIsModalOpen(false);
  };
  
  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadStatus(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const newApartments = parseApartmentCSV(text);
        const branchToUpdate = branches[0];
        if (branchToUpdate) {
            onUpdateApartments(branchToUpdate.id, newApartments);
            setUploadStatus({ message: 'Apartment data updated successfully!', type: 'success' });
        } else {
             throw new Error("No branch found to update.");
        }
      } catch (error: any) {
        setUploadStatus({ message: error.message, type: 'error' });
      } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setUploadStatus({ message: 'Failed to read the file.', type: 'error' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const parseApartmentCSV = (csvText: string): Apartment[] => {
    const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error("CSV must have a header and at least one data row.");

    const rawHeader = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const headerMap: { [key: string]: number } = {};
    rawHeader.forEach((h, i) => {
        if (h.toLowerCase().startsWith('apt')) headerMap['Apt #'] = i;
        else if (h.toLowerCase().startsWith('type')) headerMap['Type'] = i;
        else if (h.toLowerCase().startsWith('status')) headerMap['Status'] = i;
        else if (h.toLowerCase().startsWith('monthly rent')) headerMap['Monthly Rent'] = i;
        else if (h.toLowerCase().startsWith('cash collected')) headerMap['Cash Collected'] = i;
        else if (h.toLowerCase().startsWith('estimated')) headerMap['Duration'] = i;
        else if (h.toLowerCase().startsWith('lifetime')) headerMap['Lifetime Value'] = i;
        else if (h.toLowerCase().startsWith('booking source')) headerMap['Source'] = i;
    });

    const requiredHeaders = ["Apt #", "Type", "Status", "Cash Collected", "Lifetime Value", "Source"];
    for(const req of requiredHeaders) {
        if(headerMap[req] === undefined) throw new Error(`Missing required column in CSV: ${req}`);
    }

    return lines.slice(1).map((line, index) => {
        const values = line.split(',');
        
        const numberStr = values[headerMap["Apt #"]].trim();
        if (!numberStr) throw new Error(`Row ${index + 2}: 'Apt #' cannot be empty.`);

        const typeStr = values[headerMap["Type"]].trim();
        const typeMap: {[key: string]: ApartmentType} = {
            '1br': ApartmentType.ONE_BEDROOM,
            '2br': ApartmentType.TWO_BEDROOM,
            'st': ApartmentType.STUDIO
        }
        const type = typeMap[typeStr.toLowerCase()] || Object.values(ApartmentType).find(t => t.toLowerCase() === typeStr.toLowerCase());
        if (!type) throw new Error(`Row ${index + 2}: Invalid 'Type' value "${typeStr}".`);

        const statusStr = values[headerMap["Status"]].trim().toUpperCase();
        const status = Object.values(ApartmentStatus).find(s => statusStr.startsWith(s));
        if (!status) throw new Error(`Row ${index + 2}: Invalid 'Status' value "${values[headerMap["Status"]].trim()}".`);

        const lifetimeValueStr = (values[headerMap["Lifetime Value"]] || '0').replace(/[^0-9.]/g, '');
        const lifetimeValue = lifetimeValueStr ? parseFloat(lifetimeValueStr) : 0;
        
        const durationStr = (values[headerMap['Duration']] || '0').trim();
        const durationMatch = durationStr.match(/^(\d+)/);
        let contractDurationMonths = durationMatch ? parseInt(durationMatch[1], 10) : 1;
        if (contractDurationMonths === 0 && lifetimeValue > 0) contractDurationMonths = 1;

        const monthlyRentStr = (values[headerMap["Monthly Rent"]] || '').replace(/[^0-9.]/g, '');
        let monthlyRent = monthlyRentStr ? parseFloat(monthlyRentStr) : 0;
        
        if (monthlyRent === 0 && lifetimeValue > 0 && contractDurationMonths > 0) {
            monthlyRent = parseFloat((lifetimeValue / contractDurationMonths).toFixed(2));
        }

        const cashCollectedStr = (values[headerMap["Cash Collected"]] || '0').replace(/[^0-9.]/g, '');
        const cashCollected = cashCollectedStr ? parseFloat(cashCollectedStr) : 0;

        const howHeard = values[headerMap["Source"]]?.trim() || undefined;

        return {
            id: numberStr,
            number: numberStr,
            type,
            status,
            monthlyRent,
            contractDurationMonths,
            cashCollected,
            howHeard,
            lifetimeValue,
        };
    });
};

  return (
    <div className="min-h-screen bg-[#F1ECE6] text-[#4A2C5A] font-sans overflow-x-hidden">
      <Header onToggleLanguage={onToggleLanguage} />
      <main className="max-w-6xl mx-auto px-4">
        
        <FadeInUp>
          <div className="bg-white/50 p-8 rounded-2xl my-16 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-[#4A2C5A]/60 uppercase tracking-wider">Properties</h3>
              <p className="text-xl font-bold text-[#4A2C5A] mt-1">{branches.map(b => b.name).join(' & ')}</p>
            </div>
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-[#4A2C5A]/60 uppercase tracking-wider">Report For</h3>
              <p className="text-xl font-bold text-[#4A2C5A] mt-1">Olaya Investors</p>
            </div>
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-[#4A2C5A]/60 uppercase tracking-wider">Inventory</h3>
              <div className="text-lg font-semibold text-[#4A2C5A] mt-1 space-y-1">
                {branches.map(branch => {
                    const counts = branch.apartments.reduce((acc, apt) => {
                      acc[apt.type] = (acc[apt.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    const oneBedrooms = counts[ApartmentType.ONE_BEDROOM] || 0;
                    const studios = counts[ApartmentType.STUDIO] || 0;
                    const twoBedrooms = counts[ApartmentType.TWO_BEDROOM] || 0;

                    return (
                        <div key={branch.id}>
                            <p className="text-sm text-[#4A2C5A]/80">{branch.name}: <span className="font-bold text-[#2A5B64]">{branch.apartments.length} Apartments</span></p>
                            <p className="text-xs text-[#4A2C5A]/70 mt-1">
                                {oneBedrooms} one bedroom, {studios} studio, and {twoBedrooms} two bedroom apartments.
                            </p>
                        </div>
                    );
                })}
              </div>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp>
          <div className="text-center pb-24">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#4A2C5A] leading-tight">
              Property Performance Report
            </h1>
            <p className="text-lg sm:text-xl text-[#4A2C5A]/80 mt-4">A comprehensive overview for our valued property owner.</p>
          </div>
        </FadeInUp>

        <Section title="Target Annual Revenue" className="bg-gradient-to-br from-[#4A2C5A] to-[#3b2247] rounded-3xl shadow-2xl">
            <FadeInUp>
              <div className="text-center">
                  <div className="flex items-end justify-center gap-4 md:gap-8">
                      <div className="text-center">
                          <p className="text-sm text-[#F1ECE6]/70 tracking-wide uppercase">Low End</p>
                          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">{formatCurrency(totalTargetYearlyRevenue.min)}</p>
                      </div>
                      <div className="text-2xl sm:text-3xl text-white/50 pb-1 sm:pb-2 md:pb-4">~</div>
                      <div className="text-center">
                          <p className="text-sm text-[#F1ECE6]/70 tracking-wide uppercase">High End</p>
                          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">{formatCurrency(totalTargetYearlyRevenue.max)}</p>
                      </div>
                  </div>
                  <p className="text-base sm:text-lg text-[#F1ECE6]/80 mt-6 max-w-lg mx-auto">The total potential rental income for the year across all properties.</p>
              </div>
            </FadeInUp>
            <FadeInUp>
              <div className="mt-16 grid grid-cols-1 md:grid-cols-1 gap-8 max-w-2xl mx-auto">
                  {branches.map(branch => (
                      <div key={branch.id} className="bg-[#F1ECE6] p-6 rounded-2xl text-center shadow-lg">
                          <h3 className="font-bold text-xl text-[#4A2C5A]">{branch.name}</h3>
                          <div className="mt-4">
                              <p className="text-sm text-[#4A2C5A]/60 font-semibold uppercase tracking-wider">Annual Target</p>
                              <div className="mt-1 flex flex-col sm:flex-row sm:items-baseline justify-center sm:gap-2">
                                <span className="text-xl sm:text-2xl font-bold text-[#2A5B64]">{formatCurrency(branch.targetYearlyRevenue.min)}</span>
                                <span className="text-base sm:text-lg text-[#4A2C5A]/70 mx-1 sm:mx-0">to</span>
                                <span className="text-xl sm:text-2xl font-bold text-[#2A5B64]">{formatCurrency(branch.targetYearlyRevenue.max)}</span>
                              </div>
                          </div>
                          <div className="mt-3">
                              <p className="text-sm text-[#4A2C5A]/60 font-semibold uppercase tracking-wider">Monthly Target</p>
                              <div className="mt-1 flex flex-col sm:flex-row sm:items-baseline justify-center sm:gap-2">
                                <span className="text-md sm:text-lg font-semibold text-[#4A2C5A]/80">{formatCurrency(branch.targetYearlyRevenue.min / 12)}</span>
                                <span className="text-sm sm:text-base text-[#4A2C5A]/70 mx-1 sm:mx-0">to</span>
                                <span className="text-md sm:text-lg font-semibold text-[#4A2C5A]/80">{formatCurrency(branch.targetYearlyRevenue.max / 12)}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
            </FadeInUp>
        </Section>
        
        <Section title="Cash Collections" titleColor="text-[#4A2C5A]">
            <FadeInUp>
              <Metric value={formatCurrency(totalCashCollected)} label="A real-time look at revenue received from our tenants." valueColor="text-[#4A2C5A]" labelColor="text-[#4A2C5A]/80"/>
            </FadeInUp>
            <FadeInUp>
              <div className="mt-16 bg-white/50 p-6 rounded-2xl shadow-xl">
                 <h3 className="text-xl font-bold text-[#4A2C5A] mb-4 text-center">Branch Performance Comparison</h3>
                 <BranchComparisonChart data={chartData} />
              </div>
            </FadeInUp>
            <FadeInUp>
               <div className="mt-8 grid grid-cols-1 gap-4 max-w-md mx-auto">
                  {branches.map(branch => (
                       <div key={`details-${branch.id}`}>
                          <button onClick={() => toggleTable(branch.id)} className="w-full text-center py-3 px-4 bg-[#4A2C5A] text-white hover:bg-[#3b2247] rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105">
                             {visibleTable === branch.id ? 'Hide' : 'View'} {branch.name} Apartment Details
                          </button>
                       </div>
                  ))}
              </div>
              {uploadStatus && (
                  <div className={`mt-4 text-center p-3 rounded-lg ${uploadStatus.type === 'success' ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                      {uploadStatus.message}
                  </div>
              )}
               {branches.map(branch => (
                  visibleTable === branch.id && (
                      <div key={`table-${branch.id}`} className="mt-6 bg-white/50 p-4 rounded-2xl shadow-xl">
                          <ApartmentTable apartments={branch.apartments} />
                      </div>
                  )
              ))}
            </FadeInUp>
        </Section>

        <Section title="Current Tenant Lifetime Value" className="bg-gradient-to-br from-[#2A5B64] to-[#1e4248] rounded-3xl shadow-2xl">
            <FadeInUp>
              <Metric value={formatCurrency(totalLifetimeValue)} label="The total value of all current rental contracts, reflecting secured future income." />
            </FadeInUp>
        </Section>
        
        <Section title="Marketing & Outreach" titleColor="text-[#4A2C5A]">
          <FadeInUp>
            <p className="text-center text-base sm:text-lg text-[#4A2C5A]/80 mb-16 max-w-2xl mx-auto">An overview of our strategic efforts to attract and retain high-quality tenants.</p>
          </FadeInUp>
          <FadeInUp>
            <BookingSourceChart data={bookingSourceChartData} />
          </FadeInUp>
          <FadeInUp>
            <MarketingCampaigns socialVideos={SOCIAL_MEDIA_VIDEOS} />
          </FadeInUp>
        </Section>

        <footer className="relative text-center py-10 text-[#4A2C5A]/50 text-sm">
          <button 
            onClick={() => setIsModalOpen(true)}
            title="Add New Booking"
            aria-label="Add New Booking"
            className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-white/80 text-gray-600 hover:bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <PlusIcon />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <button 
            onClick={handleUploadClick}
            title="Upload Spreadsheet"
            aria-label="Upload Spreadsheet"
            className="absolute bottom-4 left-16 w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <UploadIcon />
          </button>

          &copy; {new Date().getFullYear()} Mathwaa Property Management. Confidential Report.
        </footer>
      </main>
      <AddBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitBooking}
        branches={branches}
      />
    </div>
  );
};

export default App_en;