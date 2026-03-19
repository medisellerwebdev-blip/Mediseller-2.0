import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Upload, 
  Loader2, 
  Link as LinkIcon,
  CheckCircle,
  Package,
  Activity,
  Ribbon,
  ShieldAlert,
  Zap,
  Stethoscope,
  Scale
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

const ImageUploadField = ({ label, value, onChange, placeholder = "https://example.com/image.jpg" }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('http://localhost:8001/api/admin/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange(data.url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center mb-0.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
        {value && (
          <a href={value} target="_blank" rel="noreferrer" className="text-[10px] text-primary flex items-center gap-1 hover:underline">
            <ImageIcon className="w-3 h-3" /> Preview
          </a>
        )}
      </div>
      <div className="flex gap-2">
        <Input 
          value={value || ''} 
          className="bg-white border-slate-200 flex-1 h-9 text-sm"
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleUpload}
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          className="shrink-0 border-slate-200 h-9 w-9" 
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default function HomeEditor() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/site-config');
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      toast.error('Failed to load site configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8001/api/admin/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Configuration saved successfully');
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to save configuration');
      }
    } catch (error) {
      toast.error('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  
  if (!config) return (
    <div className="text-center py-20 italic text-slate-500">
      <p>Configuration not found. Please ensure the database is seeded.</p>
      <Button onClick={fetchConfig} className="mt-4">Retry Loading</Button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Config */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg font-heading text-slate-700">Header Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Logo Text</label>
              <Input 
                value={config.header.logo_text} 
                className="bg-slate-50 border-slate-200"
                onChange={(e) => setConfig({...config, header: {...config.header, logo_text: e.target.value}})}
              />
            </div>
            <ImageUploadField 
              label="Logo Image URL" 
              value={config.header.logo_url} 
              onChange={(val) => setConfig({...config, header: {...config.header, logo_url: val}})}
            />
            <ImageUploadField 
              label="Favicon URL" 
              value={config.favicon_url} 
              placeholder="/favicon.ico"
              onChange={(val) => setConfig({...config, favicon_url: val})}
            />
          </div>
          <div className="space-y-3">
             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Navigation Items</label>
             <div className="space-y-4">
                {config.header.nav_items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-100 group transition-all hover:border-slate-300">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Label</label>
                        <Input 
                          placeholder="e.g. Home" 
                          value={item.label} 
                          className="bg-white border-slate-200 h-9"
                          onChange={(e) => {
                            const newNav = [...config.header.nav_items];
                            newNav[idx].label = e.target.value;
                            setConfig({...config, header: {...config.header, nav_items: newNav}});
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Path</label>
                        <Input 
                          placeholder="e.g. /home" 
                          value={item.path} 
                          className="bg-white border-slate-200 h-9"
                          onChange={(e) => {
                            const newNav = [...config.header.nav_items];
                            newNav[idx].path = e.target.value;
                            setConfig({...config, header: {...config.header, nav_items: newNav}});
                          }}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-white border-transparent hover:border-red-100 border" onClick={() => {
                      const newNav = config.header.nav_items.filter((_, i) => i !== idx);
                      setConfig({...config, header: {...config.header, nav_items: newNav}});
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => {
                  const newNav = [...config.header.nav_items, {label: '', path: ''}];
                  setConfig({...config, header: {...config.header, nav_items: newNav}});
                }}>
                  <Plus className="w-3 h-3 mr-2" /> Add Navigation Item
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Section Config */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg font-heading text-slate-700">Hero Section Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Badge Text</label>
                <Input 
                  value={config.hero.badge} 
                  className="bg-slate-50 border-slate-200"
                  onChange={(e) => setConfig({...config, hero: {...config.hero, badge: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hero Main Title (H1)</label>
                <Input 
                  value={config.hero.title} 
                  className="bg-slate-50 border-slate-200 font-bold"
                  onChange={(e) => setConfig({...config, hero: {...config.hero, title: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hero Subtitle</label>
                <textarea 
                  className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={config.hero.subtitle} 
                  onChange={(e) => setConfig({...config, hero: {...config.hero, subtitle: e.target.value}})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50/50 p-5 border rounded-xl space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Primary CTA (View Products)</h4>
                  <p className="text-[10px] text-slate-400">Main action button text and path</p>
                  <div className="space-y-3">
                    <Input placeholder="Button Text" value={config.hero.primary_cta.text} className="bg-white" onChange={(e) => setConfig({...config, hero: {...config.hero, primary_cta: {...config.hero.primary_cta, text: e.target.value}}})} />
                    <Input placeholder="Redirect Path" value={config.hero.primary_cta.path} className="bg-white" onChange={(e) => setConfig({...config, hero: {...config.hero, primary_cta: {...config.hero.primary_cta, path: e.target.value}}})} />
                  </div>
                </div>
                <div className="bg-slate-50/50 p-5 border rounded-xl space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Secondary CTA (Consultation)</h4>
                  <p className="text-[10px] text-slate-400">Secondary action button text and path</p>
                  <div className="space-y-3">
                    <Input placeholder="Button Text" value={config.hero.secondary_cta.text} className="bg-white" onChange={(e) => setConfig({...config, hero: {...config.hero, secondary_cta: {...config.hero.secondary_cta, text: e.target.value}}})} />
                    <Input placeholder="Redirect Path" value={config.hero.secondary_cta.path} className="bg-white" onChange={(e) => setConfig({...config, hero: {...config.hero, secondary_cta: {...config.hero.secondary_cta, path: e.target.value}}})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <ImageUploadField 
                label="Hero Image URL (The Doctor/Pharmacist)" 
                value={config.hero.image_url} 
                onChange={(val) => setConfig({...config, hero: {...config.hero, image_url: val}})}
              />
              <ImageUploadField 
                label="Hero Background Image (Optional Overlay)" 
                value={config.hero.background_image_url} 
                onChange={(val) => setConfig({...config, hero: {...config.hero, background_image_url: val}})}
              />
              
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Trust Avatars (Profile Images)</label>
                <div className="space-y-3">
                  {(config.hero.trust_avatars || []).map((avatar, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100 group">
                      <div className="flex-1">
                        <ImageUploadField 
                          label={`Avatar ${idx + 1}`} 
                          value={avatar} 
                          onChange={(val) => {
                            const newAvatars = [...config.hero.trust_avatars];
                            newAvatars[idx] = val;
                            setConfig({...config, hero: {...config.hero, trust_avatars: newAvatars}});
                          }}
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="mt-5 h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-white border-transparent hover:border-red-100 border" onClick={() => {
                        const newAvatars = config.hero.trust_avatars.filter((_, i) => i !== idx);
                        setConfig({...config, hero: {...config.hero, trust_avatars: newAvatars}});
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => {
                    const newAvatars = [...(config.hero.trust_avatars || []), 'https://i.pravatar.cc/150?u=' + Math.random()];
                    setConfig({...config, hero: {...config.hero, trust_avatars: newAvatars}});
                  }}>
                    <Plus className="w-3 h-3 mr-2" /> Add Avatar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Patients Count Label</label>
                  <Input value={config.hero.patients_count} className="bg-slate-50 border-slate-200" onChange={(e) => setConfig({...config, hero: {...config.hero, patients_count: e.target.value}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Star Rating Number</label>
                  <Input type="number" step="0.1" value={config.hero.rating} className="bg-slate-50 border-slate-200" onChange={(e) => setConfig({...config, hero: {...config.hero, rating: parseFloat(e.target.value)}})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50/50 p-5 border rounded-xl space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-green-600">Floating Trust Card</h4>
                  <div className="space-y-3">
                    <Input placeholder="Card Title" value={config.hero.floating_card_title} className="bg-white text-sm" onChange={(e) => setConfig({...config, hero: {...config.hero, floating_card_title: e.target.value}})} />
                    <Input placeholder="Card Subtitle" value={config.hero.floating_card_subtitle} className="bg-white text-sm" onChange={(e) => setConfig({...config, hero: {...config.hero, floating_card_subtitle: e.target.value}})} />
                    <Input placeholder="Icon Name (Lucide)" value={config.hero.floating_card_icon} className="bg-white text-sm" onChange={(e) => setConfig({...config, hero: {...config.hero, floating_card_icon: e.target.value}})} />
                  </div>
                </div>
                <div className="bg-slate-50/50 p-5 border rounded-xl space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600">Savings Badge (Overlay)</h4>
                  <div className="space-y-3">
                    <Input placeholder="Percentage (e.g. 60%)" value={config.hero.savings_badge_percentage} className="bg-white text-sm" onChange={(e) => setConfig({...config, hero: {...config.hero, savings_badge_percentage: e.target.value}})} />
                    <Input placeholder="Label (e.g. Average Savings)" value={config.hero.savings_badge_text} className="bg-white text-sm" onChange={(e) => setConfig({...config, hero: {...config.hero, savings_badge_text: e.target.value}})} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar Configuration */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg font-heading text-slate-700">Stats Bar Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            {(config.stats?.items || []).map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-100 group transition-all hover:border-slate-300">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Value (e.g. 45+)</label>
                    <Input 
                      value={item.value} 
                      className="bg-white border-slate-200 h-9"
                      onChange={(e) => {
                        const newStats = [...config.stats.items];
                        newStats[idx].value = e.target.value;
                        setConfig({...config, stats: {...config.stats, items: newStats}});
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Label</label>
                    <Input 
                      value={item.label} 
                      className="bg-white border-slate-200 h-9"
                      onChange={(e) => {
                        const newStats = [...config.stats.items];
                        newStats[idx].label = e.target.value;
                        setConfig({...config, stats: {...config.stats, items: newStats}});
                      }}
                    />
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-white border-transparent hover:border-red-100 border" onClick={() => {
                  const newStats = config.stats.items.filter((_, i) => i !== idx);
                  setConfig({...config, stats: {...config.stats, items: newStats}});
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed border-2 hover:bg-slate-50 h-11" onClick={() => {
              const newStats = [...(config.stats?.items || []), {value: '', label: ''}];
              setConfig({...config, stats: {...config.stats, items: newStats}});
            }}>
              <Plus className="w-4 h-4 mr-2" /> Add Stat Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Section Configuration */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg font-heading text-slate-700">Categories Section Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Section Badge</label>
              <Input 
                value={config.categories_section?.badge || ''} 
                className="bg-slate-50 border-slate-200"
                onChange={(e) => setConfig({...config, categories_section: {...config.categories_section, badge: e.target.value}})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Main Title</label>
              <Input 
                value={config.categories_section?.title || ''} 
                className="bg-slate-50 border-slate-200 font-bold"
                onChange={(e) => setConfig({...config, categories_section: {...config.categories_section, title: e.target.value}})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subtitle</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={config.categories_section?.subtitle || ''} 
                onChange={(e) => setConfig({...config, categories_section: {...config.categories_section, subtitle: e.target.value}})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category Cards</label>
            <div className="space-y-4">
              {(config.categories_section?.cards || []).map((card, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 group transition-all hover:border-slate-300">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Title</label>
                        <Input value={card.title} className="bg-white h-9" onChange={(e) => {
                          const newCards = [...config.categories_section.cards];
                          newCards[idx].title = e.target.value;
                          setConfig({...config, categories_section: {...config.categories_section, cards: newCards}});
                        }} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Sub-text</label>
                        <Input value={card.subtitle} className="bg-white h-9" onChange={(e) => {
                          const newCards = [...config.categories_section.cards];
                          newCards[idx].subtitle = e.target.value;
                          setConfig({...config, categories_section: {...config.categories_section, cards: newCards}});
                        }} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Icon Name (Lucide)</label>
                        <Input value={card.icon_name} className="bg-white h-9" onChange={(e) => {
                          const newCards = [...config.categories_section.cards];
                          newCards[idx].icon_name = e.target.value;
                          setConfig({...config, categories_section: {...config.categories_section, cards: newCards}});
                        }} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Redirect Path</label>
                        <Input value={card.path} className="bg-white h-9" onChange={(e) => {
                          const newCards = [...config.categories_section.cards];
                          newCards[idx].path = e.target.value;
                          setConfig({...config, categories_section: {...config.categories_section, cards: newCards}});
                        }} />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-red-100" onClick={() => {
                      const newCards = config.categories_section.cards.filter((_, i) => i !== idx);
                      setConfig({...config, categories_section: {...config.categories_section, cards: newCards}});
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed border-2 hover:bg-slate-50 h-11" onClick={() => {
                const newCards = [...(config.categories_section?.cards || []), {title: '', subtitle: '', icon_name: 'Package', color_class: 'from-primary/10 to-primary/5', path: '/products'}];
                setConfig({...config, categories_section: {...config.categories_section, cards: newCards}});
              }}>
                <Plus className="w-4 h-4 mr-2" /> Add Category Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-8 flex justify-end">
        <Button size="lg" className="rounded-full shadow-2xl h-14 px-8" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
          Publish Site Updates
        </Button>
      </div>
    </div>
  );
}
