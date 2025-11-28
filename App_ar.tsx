
import React, { useState, useRef } from 'react';
import { MATHWAA_SHARE_PERCENTAGE } from './constants';
import { SOCIAL_MEDIA_VIDEOS_AR } from './constants_ar';
import { Apartment, ApartmentStatus, ApartmentType, type Branch, type NewBooking } from './types';
import Header_ar from './components/Header_ar';
import ApartmentTable_ar from './components/ApartmentTable_ar';
import MarketingCampaigns_ar from './components/MarketingCampaigns_ar';
import BranchComparisonChart_ar from './components/BranchComparisonChart_ar';
import BookingSourceChart_ar from './components/BookingSourceChart_ar';
import AddBookingModal_ar from './components/AddBookingModal_ar';
import { PlusIcon, UploadIcon } from './components/Icons';
import { FadeInUp, StaggeredGrid, AnimatedItem } from './components/AnimatedWrappers';
import { Section, Metric, ShareBreakdown, OccupancyRadial } from './components/DashboardComponents';


const App_ar: React.FC<{ 
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
    return `${value.toLocaleString('ar-SA')} ريال`;
  };

  const translateBranchName = (name: string) => {
    if (name === 'Mathwaa 33 - Al Olaya') {
        return 'مثوى ٣٣ - العليا';
    }
    return name;
  };

  const chartData = branches.map(branch => ({
    name: translateBranchName(branch.name),
    'المبالغ المحصلة': branch.apartments.reduce((sum, apt) => sum + apt.cashCollected, 0),
    'الإيرادات المستهدفة': branch.targetYearlyRevenue.max,
  }));
  
  const getSourceCategory = (source: string): string => {
    const cleanedSource = source.toLowerCase();
    if (cleanedSource.includes('bayut') || cleanedSource.includes('aqar') || cleanedSource.includes('listing')) {
      return 'منصات الإدراج';
    }
    if (cleanedSource.includes('social') || cleanedSource.includes('facebook') || cleanedSource.includes('instagram') || cleanedSource.includes('tiktok')) {
      return 'إعلانات وسائل التواصل الاجتماعي المدفوعة';
    }
    if (cleanedSource.includes('word of mouth')) {
      return 'التوصيات الشفهية';
    }
    if (cleanedSource.includes('walk in') || cleanedSource.includes('building board')) {
      return 'زيارة مباشرة';
    }
    return 'أخرى';
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
            setUploadStatus({ message: 'تم تحديث بيانات الشقق بنجاح!', type: 'success' });
        } else {
             throw new Error("لم يتم العثور على فرع لتحديثه.");
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
      setUploadStatus({ message: 'فشل في قراءة الملف.', type: 'error' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const parseApartmentCSV = (csvText: string): Apartment[] => {
    const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error("يجب أن يحتوي ملف CSV على صف رأس وصف بيانات واحد على الأقل.");

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
        if(headerMap[req] === undefined) throw new Error(`العمود المطلوب مفقود في ملف CSV: ${req}`);
    }

    return lines.slice(1).map((line, index) => {
        const values = line.split(',');
        
        const numberStr = values[headerMap["Apt #"]].trim();
        if (!numberStr) throw new Error(`الصف ${index + 2}: 'رقم الشقة' لا يمكن أن يكون فارغًا.`);

        const typeStr = values[headerMap["Type"]].trim();
        const typeMap: {[key: string]: ApartmentType} = {
            '1br': ApartmentType.ONE_BEDROOM,
            '2br': ApartmentType.TWO_BEDROOM,
            'st': ApartmentType.STUDIO
        }
        const type = typeMap[typeStr.toLowerCase()] || Object.values(ApartmentType).find(t => t.toLowerCase() === typeStr.toLowerCase());
        if (!type) throw new Error(`الصف ${index + 2}: قيمة "النوع" غير صالحة "${typeStr}".`);

        const statusStr = values[headerMap["Status"]].trim().toUpperCase();
        const status = Object.values(ApartmentStatus).find(s => statusStr.startsWith(s));
        if (!status) throw new Error(`الصف ${index + 2}: قيمة "الحالة" غير صالحة "${values[headerMap["Status"]].trim()}".`);

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
    <div className="min-h-screen bg-[#F1ECE6] text-[#4A2C5A] overflow-x-hidden">
      <Header_ar onToggleLanguage={onToggleLanguage} />
      <main className="max-w-6xl mx-auto px-4">
        <FadeInUp>
          <div className="bg-white/50 p-8 rounded-2xl my-16 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-[#4A2C5A]/60 uppercase tracking-wider">العقارات</h3>
              <p className="text-xl font-bold text-[#4A2C5A] mt-1">{branches.map(b => translateBranchName(b.name)).join(' و ')}</p>
            </div>
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-[#4A2C5A]/60 uppercase tracking-wider">تقرير لـ</h3>
              <p className="text-xl font-bold text-[#4A2C5A] mt-1">مستثمرو العليا</p>
            </div>
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-[#4A2C5A]/60 uppercase tracking-wider">المخزون</h3>
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
                      <p className="text-sm text-[#4A2C5A]/80">
                        {translateBranchName(branch.name)}: <span className="font-bold text-[#2A5B64]">{branch.apartments.length} شقة</span>
                      </p>
                       <p className="text-xs text-[#4A2C5A]/70 mt-1">
                          {oneBedrooms} شقة بغرفة نوم، {studios} استوديو، و {twoBedrooms} شقق بغرفتي نوم.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp>
          <div className="text-center pb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#4A2C5A] leading-tight">
              تقرير أداء العقارات
            </h1>
            <p className="text-lg sm:text-xl text-[#4A2C5A]/80 mt-4">نظرة عامة شاملة لمالك العقار.</p>
          </div>
        </FadeInUp>

        <Section title="نظرة عامة على الإشغال" titleColor="text-[#4A2C5A]" className="!mt-0 !pt-8">
          <StaggeredGrid>
            <AnimatedItem>
              <OccupancyRadial 
                percentage={90} 
                label="نسبة الإشغال الحالية" 
                subLabel="٢٣ من أصل ٢٦ شقة مؤجرة" 
                color="#2A5B64" 
              />
            </AnimatedItem>
            <AnimatedItem>
              <OccupancyRadial 
                percentage={90} 
                label="توقعات الإشغال (١٢ شهرًا)" 
                subLabel="من المتوقع الحفاظ على إشغال ٢٣ من أصل ٢٦ وحدة شهرياً للعام القادم" 
                color="#2A5B64" 
              />
            </AnimatedItem>
            <AnimatedItem>
              <OccupancyRadial 
                percentage={10} 
                label="فرص التأجير قصير الأجل" 
                subLabel="٣ وحدات محجوزة لعوائد عالية" 
                color="#8A6E99" 
              />
            </AnimatedItem>
          </StaggeredGrid>
        </Section>
        
        <Section title="الإيرادات السنوية المستهدفة" className="bg-gradient-to-br from-[#4A2C5A] to-[#3b2247] rounded-3xl shadow-2xl">
            <FadeInUp>
              <div className="text-center">
                  <div className="flex items-end justify-center gap-4 md:gap-8">
                      <div className="text-center">
                          <p className="text-sm text-[#F1ECE6]/70 tracking-wide uppercase">الحد الأدنى</p>
                          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">{formatCurrency(totalTargetYearlyRevenue.min)}</p>
                      </div>
                      <div className="text-2xl sm:text-3xl text-white/50 pb-1 sm:pb-2 md:pb-4">إلى</div>
                      <div className="text-center">
                          <p className="text-sm text-[#F1ECE6]/70 tracking-wide uppercase">الحد الأعلى</p>
                          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">{formatCurrency(totalTargetYearlyRevenue.max)}</p>
                      </div>
                  </div>
                  <p className="text-base sm:text-lg text-[#F1ECE6]/80 mt-6 max-w-lg mx-auto">إجمالي الدخل الإيجاري المحتمل للسنة عبر جميع العقارات.</p>
              </div>
            </FadeInUp>
            <FadeInUp>
              <div className="mt-16 grid grid-cols-1 md:grid-cols-1 gap-8 max-w-2xl mx-auto">
                  {branches.map(branch => (
                      <div key={branch.id} className="bg-[#F1ECE6] p-6 rounded-2xl text-center shadow-lg">
                          <h3 className="font-bold text-xl text-[#4A2C5A]">{translateBranchName(branch.name)}</h3>
                          <div className="mt-4">
                              <p className="text-sm text-[#4A2C5A]/60 font-semibold uppercase tracking-wider">الهدف السنوي</p>
                              <div className="mt-1 flex flex-col sm:flex-row sm:items-baseline justify-center sm:gap-2">
                                <span className="text-xl sm:text-2xl font-bold text-[#2A5B64]">{formatCurrency(branch.targetYearlyRevenue.min)}</span>
                                <span className="text-base sm:text-lg text-[#4A2C5A]/70 mx-1 sm:mx-0">إلى</span>
                                <span className="text-xl sm:text-2xl font-bold text-[#2A5B64]">{formatCurrency(branch.targetYearlyRevenue.max)}</span>
                              </div>
                          </div>
                          <div className="mt-3">
                              <p className="text-sm text-[#4A2C5A]/60 font-semibold uppercase tracking-wider">الهدف الشهري</p>
                              <div className="mt-1 flex flex-col sm:flex-row sm:items-baseline justify-center sm:gap-2">
                                <span className="text-md sm:text-lg font-semibold text-[#4A2C5A]/80">{formatCurrency(branch.targetYearlyRevenue.min / 12)}</span>
                                <span className="text-sm sm:text-base text-[#4A2C5A]/70 mx-1 sm:mx-0">إلى</span>
                                <span className="text-md sm:text-lg font-semibold text-[#4A2C5A]/80">{formatCurrency(branch.targetYearlyRevenue.max / 12)}</span>
                              </div>
                          </div>
                           <div className="mt-4 pt-4 border-t border-[#4A2C5A]/20">
                              <p className="text-sm text-[#4A2C5A]/60 font-semibold uppercase tracking-wider">توزيع الحصص الشهرية</p>
                              <div className="mt-2 text-xs text-right grid grid-cols-2 gap-x-4 gap-y-2">
                                  <div>
                                      <p className="font-bold text-[#4A2C5A]">حصة مثوى</p>
                                      <p className="text-[#4A2C5A]/80">{formatCurrency((branch.targetYearlyRevenue.min / 12) * MATHWAA_SHARE_PERCENTAGE)} إلى {formatCurrency((branch.targetYearlyRevenue.max / 12) * MATHWAA_SHARE_PERCENTAGE)}</p>
                                  </div>
                                  <div>
                                      <p className="font-bold text-[#4A2C5A]">حصة المستثمر</p>
                                      <p className="text-[#4A2C5A]/80">{formatCurrency((branch.targetYearlyRevenue.min / 12) * (1 - MATHWAA_SHARE_PERCENTAGE))} إلى {formatCurrency((branch.targetYearlyRevenue.max / 12) * (1 - MATHWAA_SHARE_PERCENTAGE))}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
            </FadeInUp>
            <FadeInUp>
              <ShareBreakdown
                title="توزيع الحصص السنوي"
                totalValue={totalTargetYearlyRevenue}
                mathwaaSharePercentage={MATHWAA_SHARE_PERCENTAGE}
                mathwaaLabel="حصة مثوى"
                investorLabel="حصة المستثمر"
                formatCurrency={formatCurrency}
                className="text-white"
                valueClassName="text-xl sm:text-2xl"
              />
            </FadeInUp>
        </Section>
        
        <Section title="المبالغ المحصلة" titleColor="text-[#4A2C5A]">
            <FadeInUp>
              <Metric value={formatCurrency(totalCashCollected)} label="نظرة محدثة على الإيرادات المستلمة من المستأجرين." valueColor="text-[#4A2C5A]" labelColor="text-[#4A2C5A]/80"/>
            </FadeInUp>
            <FadeInUp>
              <ShareBreakdown
                title="توزيع الحصص"
                totalValue={totalCashCollected}
                mathwaaSharePercentage={MATHWAA_SHARE_PERCENTAGE}
                mathwaaLabel="حصة مثوى"
                investorLabel="حصة المستثمر"
                formatCurrency={formatCurrency}
                className="text-[#4A2C5A]"
              />
            </FadeInUp>
            <FadeInUp>
              <div className="mt-16 bg-white/50 p-6 rounded-2xl shadow-xl">
                 <h3 className="text-xl font-bold text-[#4A2C5A] mb-4 text-center">مقارنة أداء الفروع</h3>
                 <BranchComparisonChart_ar data={chartData} />
              </div>
            </FadeInUp>
            <FadeInUp>
               <div className="mt-8 grid grid-cols-1 gap-4 max-w-md mx-auto">
                  {branches.map(branch => (
                       <div key={`details-${branch.id}`}>
                          <button onClick={() => toggleTable(branch.id)} className="w-full text-center py-3 px-4 bg-[#4A2C5A] text-white hover:bg-[#3b2247] rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105">
                             {visibleTable === branch.id ? 'إخفاء' : 'عرض'} تفاصيل شقق {translateBranchName(branch.name)}
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
                          <ApartmentTable_ar apartments={branch.apartments} />
                      </div>
                  )
              ))}
            </FadeInUp>
        </Section>

        <Section title="القيمة الدائمة للمستأجرين الحاليين" className="bg-gradient-to-br from-[#2A5B64] to-[#1e4248] rounded-3xl shadow-2xl">
            <FadeInUp>
              <Metric value={formatCurrency(totalLifetimeValue)} label="القيمة الإجمالية لجميع عقود الإيجار الحالية، مما يعكس الدخل المستقبلي المضمون." />
            </FadeInUp>
             <FadeInUp>
              <ShareBreakdown
                title="توزيع الحصص"
                totalValue={totalLifetimeValue}
                mathwaaSharePercentage={MATHWAA_SHARE_PERCENTAGE}
                mathwaaLabel="حصة مثوى"
                investorLabel="حصة المستثمر"
                formatCurrency={formatCurrency}
                className="text-white"
              />
            </FadeInUp>
        </Section>
        
        <Section title="التسويق والتواصل" titleColor="text-[#4A2C5A]">
            <FadeInUp>
              <p className="text-center text-base sm:text-lg text-[#4A2C5A]/80 mb-16 max-w-2xl mx-auto">نظرة عامة على جهودنا الاستراتيجية لجذب المستأجرين ذوي الجودة العالية والاحتفاظ بهم.</p>
            </FadeInUp>
            <FadeInUp>
              <BookingSourceChart_ar data={bookingSourceChartData} />
            </FadeInUp>
            <FadeInUp>
              <MarketingCampaigns_ar socialVideos={SOCIAL_MEDIA_VIDEOS_AR} />
            </FadeInUp>
        </Section>
        <footer className="relative text-center py-10 text-[#4A2C5A]/50 text-sm">
           <button 
            onClick={() => setIsModalOpen(true)}
            title="إضافة حجز جديد"
            aria-label="إضافة حجز جديد"
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/80 text-gray-600 hover:bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
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
            title="تحميل جدول البيانات"
            aria-label="تحميل جدول البيانات"
            className="absolute bottom-4 right-16 w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <UploadIcon />
          </button>

          &copy; {new Date().getFullYear()} مثوى لإدارة العقارات. تقرير سري.
        </footer>
      </main>
      <AddBookingModal_ar
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitBooking}
        branches={branches}
      />
    </div>
  );
};

export default App_ar;
