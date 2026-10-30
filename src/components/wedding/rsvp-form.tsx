"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, AlertCircle, Loader2, Upload, Heart } from "lucide-react";

interface FormData {
  attendance: "attend" | "decline" | "pending" | "";
  host: "yuri" | "tomoro" | "";
  message: string;
  name: string;
  furigana: string;
  email: string;
  gender: "male" | "female" | "unspecified" | "";
  postalCode: string;
  address: string;
  phone: string;
  allergies: string;
  photoFileName: string;
}

export function RsvpForm() {
  const [formData, setFormData] = useState<FormData>({
    attendance: "attend",
    host: "yuri",
    message: "",
    name: "",
    furigana: "",
    email: "",
    gender: "male",
    postalCode: "",
    address: "",
    phone: "",
    allergies: "None",
    photoFileName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setErrorMsg(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, photoFileName: e.target.files![0].name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.attendance) {
      setErrorMsg("Please select whether you will attend.");
      return;
    }
    if (!formData.host) {
      setErrorMsg("Please select your host.");
      return;
    }
    if (!formData.name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!formData.furigana.trim()) {
      setErrorMsg("Please enter your phonetic name/reading.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!formData.allergies.trim()) {
      setErrorMsg("Please enter dietary requirements or allergies (or write 'None').");
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable submission
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="p-8 sm:p-14 border border-[#333333] bg-[#0a0a0a] text-center space-y-6 max-w-2xl mx-auto rounded-none"
      >
        <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mx-auto text-white">
          <Heart className="w-6 h-6 fill-white/10" />
        </div>

        <div className="space-y-3">
          <span className="text-[12px] font-sans tracking-[0.25em] uppercase text-[#888888] block">
            Thank you for your reply
          </span>
          <h3 className="font-mincho text-2xl sm:text-3xl text-white tracking-widest">
            RSVP Received
          </h3>
          <p className="text-sm text-[#aaaaaa] font-mincho leading-relaxed pt-2">
            Thank you very much for your warm reply, {formData.name}.
            <br />
            We look forward to seeing you at the gathering.
          </p>
        </div>

        <div className="pt-6 border-t border-[#222222] flex justify-center">
          <button
            onClick={() => {
              setIsSuccess(false);
            }}
            className="px-6 py-2.5 border border-[#444444] hover:border-white text-xs font-sans tracking-widest uppercase text-[#cccccc] hover:text-white transition-colors"
          >
            Review and edit responses
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-16 max-w-3xl mx-auto text-left font-mincho">
      {/* 01 Reply */}
      <div className="space-y-8 border-b border-[#333333] pb-12">
        <div className="flex items-baseline gap-3">
          <span className="font-sans text-xs tracking-widest text-[#888888] uppercase">01</span>
          <h3 className="text-xl sm:text-2xl text-white tracking-wider">Reply</h3>
        </div>

        {/* Attendance */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-[#cccccc]">
            <span className="text-[11px] px-1.5 py-0.5 border border-[#555555] text-white">Required</span>
            <span>Attendance</span>
          </label>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "attend", label: "Attending" },
              { id: "decline", label: "Declining" },
              { id: "pending", label: "Pending" },
            ].map((opt) => {
              const isSelected = formData.attendance === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleInputChange("attendance", opt.id)}
                  className={`py-3.5 px-4 text-center text-sm border transition-all ${
                    isSelected
                      ? "border-white bg-white text-black font-semibold shadow-md"
                      : "border-[#333333] text-[#cccccc] hover:border-[#666666] bg-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Host Selection */}
        <div className="space-y-3 pt-4">
          <label className="flex items-center gap-2 text-sm text-[#cccccc]">
            <span className="text-[11px] px-1.5 py-0.5 border border-[#555555] text-white">Required</span>
            <span>Host</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "yuri", label: "Bride (Yuri)" },
              { id: "tomoro", label: "Groom (Tomoro)" },
            ].map((opt) => {
              const isSelected = formData.host === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleInputChange("host", opt.id)}
                  className={`py-3 px-4 text-center text-sm border transition-all ${
                    isSelected
                      ? "border-white bg-white text-black font-semibold shadow-md"
                      : "border-[#333333] text-[#cccccc] hover:border-[#666666] bg-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 02 Memory */}
      <div className="space-y-8 border-b border-[#333333] pb-12">
        <div className="flex items-baseline gap-3">
          <span className="font-sans text-xs tracking-widest text-[#888888] uppercase">02</span>
          <h3 className="text-xl sm:text-2xl text-white tracking-wider">Memory</h3>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[#cccccc]">
            <span className="text-[11px] px-1.5 py-0.5 border border-[#444444] text-[#888888]">Optional</span>
            <span>Message</span>
          </label>
          <p className="text-xs text-[#777777]">※ May be shared during the celebration</p>
          <textarea
            rows={4}
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            placeholder="Share a message or blessing for the couple..."
            className="w-full bg-transparent border border-[#333333] focus:border-white p-3.5 text-sm text-white placeholder-[#555555] focus:outline-none transition-colors"
          />
        </div>

        {/* Memories / Photos */}
        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-2 text-sm text-[#cccccc]">
            <span className="text-[11px] px-1.5 py-0.5 border border-[#444444] text-[#888888]">Optional</span>
            <span>Memories / Photo Upload</span>
          </label>
          <p className="text-xs text-[#777777]">※ May be shared during the celebration</p>

          <label className="flex flex-col items-center justify-center p-6 border border-dashed border-[#444444] hover:border-white cursor-pointer transition-colors text-center bg-white/[0.01]">
            <Upload className="w-5 h-5 text-[#888888] mb-2" />
            <span className="text-xs text-[#cccccc]">
              {formData.photoFileName ? formData.photoFileName : "Select photo file (click or drag)"}
            </span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* 03 Profile */}
      <div className="space-y-8 border-b border-[#333333] pb-12">
        <div className="flex items-baseline gap-3">
          <span className="font-sans text-xs tracking-widest text-[#888888] uppercase">03</span>
          <h3 className="text-xl sm:text-2xl text-white tracking-wider">Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#cccccc]">
              <span className="text-[11px] px-1.5 py-0.5 border border-[#555555] text-white">Required</span>
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Jane Doe"
              className="w-full bg-transparent border border-[#333333] focus:border-white p-3 text-sm text-white placeholder-[#555555] focus:outline-none transition-colors"
            />
          </div>

          {/* Phonetic Reading */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#cccccc]">
              <span className="text-[11px] px-1.5 py-0.5 border border-[#555555] text-white">Required</span>
              <span>Phonetic Name / Reading</span>
            </label>
            <input
              type="text"
              value={formData.furigana}
              onChange={(e) => handleInputChange("furigana", e.target.value)}
              placeholder="jane doe"
              className="w-full bg-transparent border border-[#333333] focus:border-white p-3 text-sm text-white placeholder-[#555555] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[#cccccc]">
            <span className="text-[11px] px-1.5 py-0.5 border border-[#555555] text-white">Required</span>
            <span>Email Address</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="example@domain.com"
            className="w-full bg-transparent border border-[#333333] focus:border-white p-3 text-sm text-white placeholder-[#555555] focus:outline-none transition-colors"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[#cccccc]">
            <span className="text-[11px] px-1.5 py-0.5 border border-[#555555] text-white">Required</span>
            <span>Gender</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "male", label: "Male" },
              { id: "female", label: "Female" },
              { id: "unspecified", label: "Prefer not to say" },
            ].map((opt) => {
              const isSelected = formData.gender === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleInputChange("gender", opt.id)}
                  className={`py-2.5 px-3 text-center text-xs border transition-all ${
                    isSelected
                      ? "border-white bg-white text-black font-semibold"
                      : "border-[#333333] text-[#cccccc] hover:border-[#666666] bg-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Postal Code & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#cccccc]">
              <span className="text-[11px] px-1.5 py-0.5 border border-[#444444] text-[#888888]">Optional</span>
              <span>Postal Code</span>
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              placeholder="100001"
              className="w-full bg-transparent border border-[#333333] focus:border-white p-3 text-sm text-white placeholder-[#555555] focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#cccccc]">
              <span className="text-[11px] px-1.5 py-0.5 border border-[#444444] text-[#888888]">Optional</span>
              <span>Address</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Street Address, City, State"
              className="w-full bg-transparent border border-[#333333] focus:border-white p-3 text-sm text-white placeholder-[#555555] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[#cccccc]">
            <span className="text-[11px] px-1.5 py-0.5 border border-[#444444] text-[#888888]">Optional</span>
            <span>Phone Number</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full bg-transparent border border-[#333333] focus:border-white p-3 text-sm text-white placeholder-[#555555] focus:outline-none transition-colors"
          />
        </div>

        {/* Dietary Requirements / Allergies */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[#cccccc]">
            <span className="text-[11px] px-1.5 py-0.5 border border-[#555555] text-white">Required</span>
            <span>Dietary Requirements &amp; Allergies</span>
          </label>
          <textarea
            rows={3}
            value={formData.allergies}
            onChange={(e) => handleInputChange("allergies", e.target.value)}
            placeholder="Please specify any food allergies or dietary restrictions (or write 'None')"
            className="w-full bg-transparent border border-[#333333] focus:border-white p-3.5 text-sm text-white placeholder-[#555555] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Error alert */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 border border-red-500/50 bg-red-950/20 text-red-300 text-xs flex items-center gap-2.5 font-sans"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <div className="space-y-4 pt-4 text-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-12 py-4 border border-white bg-white text-black hover:bg-black hover:text-white transition-all duration-300 text-sm tracking-[0.25em] uppercase font-sans font-medium disabled:opacity-50 flex items-center justify-center gap-2 mx-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit RSVP</span>
          )}
        </button>

        <p className="text-[11px] text-[#777777] font-mincho leading-relaxed">
          ※ Submission may take a few moments. Please do not close your browser.
        </p>
      </div>
    </form>
  );
}
