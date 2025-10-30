"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { districts, districtHindiMap } from "@/lib/districts";

const hindiMessages = {
  prompt:
    "जारी रखने के लिए कृपया लोकेशन एक्सेस की अनुमति दें, या मैन्युअल रूप से अपना जिला चुनें।",
  denied: "लोकेशन एक्सेस अस्वीकार कर दिया गया। कृपया नीचे अपना जिला चुनें।",
  granted: "लोकेशन एक्सेस प्रदान किया गया। विवरण प्राप्त कर रहे हैं...",
  error: "लोकेशन प्राप्त करने में त्रुटि। कृपया मैन्युअल रूप से चुनें।",
  unsupported: "आपका ब्राउज़र जियोलोकेशन का समर्थन नहीं करता है।",
};

type MessageStatus = keyof typeof hindiMessages;

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<MessageStatus>("prompt");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [detected, setDetected] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return [];
    const searchLower = search.toLowerCase();
    return districts.filter((district) => {
      const hindiName = districtHindiMap[district] || "";
      return (
        district.toLowerCase().includes(searchLower) ||
        hindiName.includes(search)
      );
    });
  }, [search]);

  const isRedirecting = status === "granted" && detected;

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            );
            const data = await res.json();
            setDetected(
              data.address?.state_district ||
                data.address?.county ||
                "Unknown District"
            );
            setStatus("granted");
          } catch {
            setStatus("denied");
          }
        },
        () => setStatus("denied")
      );
    } else {
      setStatus("denied");
    }
  }, []);

  useEffect(() => {
    if (!isRedirecting) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    const idx = districts.findIndex(
      (d) => d.toLowerCase() === detected?.toLowerCase()
    );
    router.push(`/district/${idx >= 0 ? idx : 0}`);
  }, [countdown, isRedirecting, detected, router]);

  useEffect(() => {
    if (!isRedirecting) return;

    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const newProgress = Math.min((elapsed / 5000) * 100, 100);
      setProgress(newProgress);
      if (newProgress < 100) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isRedirecting]);

  const navigate = (district: string) => {
    const idx = districts.findIndex(
      (d) => d.toLowerCase() === district.toLowerCase()
    );
    router.push(`/district/${idx >= 0 ? idx : 0}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-semibold text-gray-900">स्वागत है</h1>
            {/* Use Hindi messages here */}
            <p className="text-gray-600 text-sm">
              {hindiMessages[status as keyof typeof hindiMessages]}
            </p>
          </div>

          {status === "denied" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  राज्य
                </label>
                <input
                  type="text"
                  value="उत्तर प्रदेश"
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm"
                />
              </div>

              <div className="relative">
                <label className="block text-sm text-gray-600 mb-2">जिला</label>
                <input
                  type="text"
                  value={districtHindiMap[search] || search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="अपना जिला खोजें..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 text-sm"
                />

                {showDropdown && filtered.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
                    {filtered.map((district, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearch(district);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm border-b border-gray-100 last:border-b-0"
                      >
                        {districtHindiMap[district]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(search)}
                disabled={!search || !districts.includes(search)}
                className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                सबमिट करें
              </button>

              {search && districtHindiMap[search] && (
                <p className="text-sm text-gray-600 pt-2">
                  चयनित:{" "}
                  <span className="text-gray-900">
                    {districtHindiMap[search]}, उत्तर प्रदेश
                  </span>
                </p>
              )}
            </div>
          )}

          {status === "granted" && detected && (
            <div className="text-center py-8 space-y-4">
              <p className="text-gray-600 text-sm">
                आपकी लोकेशन का पता लगा लिया गया है
              </p>
              <p className="text-lg text-gray-900">
                {districtHindiMap[detected] || detected}
              </p>
              <p className="text-sm text-gray-600">उत्तर प्रदेश</p>
              {isRedirecting && (
                <button
                  onClick={() => {
                    setStatus("denied");
                    setCountdown(5);
                    setProgress(0);
                  }}
                  className="mt-4 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 underline"
                >
                  जिला बदलें
                </button>
              )}
            </div>
          )}

          {status === "granted" && !detected && (
            <p className="text-center py-8 text-gray-600 text-sm">
              लोकेशन विवरण प्राप्त कर रहे हैं...
            </p>
          )}
        </div>
      </div>

      {isRedirecting && (
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-gray-900"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
