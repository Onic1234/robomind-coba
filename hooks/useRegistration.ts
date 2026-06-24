import { useState } from "react";
import { submitRegistration, RegistrationResponse } from "../scripts/mock-api";

export interface FormErrors {
  parentName?: string;
  email?: string;
  childAge?: string;
  spanishLevel?: string;
}

export function useRegistration() {
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [childAge, setChildAge] = useState("");
  const [spanishLevel, setSpanishLevel] = useState("");
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState<RegistrationResponse | null>(null);

  // Quick live client validation helper
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!parentName.trim()) {
      newErrors.parentName = "Nama orang tua harus diisi.";
    } else if (parentName.trim().length < 3) {
      newErrors.parentName = "Nama minimal 3 karakter.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email harus diisi.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Format email tidak valid.";
    }

    const ageNum = parseInt(childAge, 10);
    if (!childAge.trim()) {
      newErrors.childAge = "Umur anak harus diisi.";
    } else if (isNaN(ageNum) || ageNum <= 0 || ageNum > 18) {
      newErrors.childAge = "Umur anak harus antara 1-18 tahun.";
    }

    if (!spanishLevel) {
      newErrors.spanishLevel = "Pilih tingkat kemahiran.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setResponse(null);

    try {
      const result = await submitRegistration({
        parentName,
        email,
        childAge,
        spanishLevel,
      });

      setResponse(result);
      if (result.success) {
        setSuccess(true);
        // Reset form values on success
        setParentName("");
        setEmail("");
        setChildAge("");
        setSpanishLevel("");
        setErrors({});
      } else {
        // Map backend errors if returned
        setErrors({
          parentName: result.message.includes("Nama") ? result.message : undefined,
          email: result.message.includes("email") ? result.message : undefined,
          childAge: result.message.includes("Umur") ? result.message : undefined,
          spanishLevel: result.message.includes("tingkat") ? result.message : undefined,
        });
      }
    } catch (err) {
      setResponse({
        success: false,
        message: "Terjadi kesalahan koneksi. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setParentName("");
    setEmail("");
    setChildAge("");
    setSpanishLevel("");
    setErrors({});
    setSuccess(false);
    setResponse(null);
  };

  return {
    parentName,
    setParentName,
    email,
    setEmail,
    childAge,
    setChildAge,
    spanishLevel,
    setSpanishLevel,
    errors,
    loading,
    success,
    response,
    handleRegister,
    resetForm,
  };
}
