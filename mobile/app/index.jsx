import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

export default function Landing() {

  const services = [
    { name: 'Instagram', icon: 'logo-instagram', color: '#E1306C', bg: '#FDF2F8' },
    { name: 'Facebook', icon: 'logo-facebook', color: '#1877F2', bg: '#EFF6FF' },
    { name: 'TikTok', icon: 'logo-tiktok', color: '#000000', bg: '#F8FAFC' },
  ];

  const benefits = [
    {
      title: 'Hỗ Trợ Nhiệt Tình',
      desc: 'Đội ngũ hỗ trợ 24/24, giải đáp mọi thắc mắc.',
      icon: 'headset-outline'
    },
    {
      title: 'Giá Thành Hợp Lý',
      desc: 'Giá rẻ nhất Việt Nam. Phù hợp cho cả đại lý.',
      icon: 'pricetag-outline'
    },
    {
      title: 'Giao Diện Thân Thiện',
      desc: 'Tối giản, dễ sử dụng cho người mới.',
      icon: 'phone-portrait-outline'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
            <Text style={styles.logoText}>HUYTICHXANH</Text>
            <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
        </View>
        <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonText}>Đăng Nhập</Text>
            </TouchableOpacity>
        </Link>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>
                    Hệ thống dịch vụ{'\n'}
                    <Text style={styles.highlightText}>SMM PANEL</Text>{'\n'}
                    an toàn và uy tín
                </Text>

                <View style={styles.platformBadges}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.platformText}>Facebook - TikTok - Instagram</Text>
                    <Text style={styles.star}>⭐</Text>
                </View>

                <View style={styles.heroButtons}>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity style={styles.primaryButton}>
                            <Text style={styles.primaryButtonText}>Đăng Nhập</Text>
                        </TouchableOpacity>
                    </Link>
                     <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity style={styles.secondaryButton}>
                            <Text style={styles.secondaryButtonText}>Đăng Ký</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
                <Text style={styles.sectionTitle}>Lợi Ích Của Bạn</Text>
                <View style={styles.benefitsGrid}>
                    {benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitCard}>
                            <View style={styles.benefitIconContainer}>
                                <Ionicons name={benefit.icon} size={32} color="#3B82F6" />
                            </View>
                            <Text style={styles.benefitTitle}>{benefit.title}</Text>
                            <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Services Preview */}
             <View style={styles.servicesSection}>
                <Text style={styles.sectionTitle}>Dịch Vụ Đa Dạng</Text>
                <View style={styles.servicesRow}>
                    {services.map((service, index) => (
                        <View key={index} style={[styles.serviceCard, { backgroundColor: service.bg }]}>
                            <Ionicons name={service.icon} size={28} color={service.color} />
                            <Text style={[styles.serviceName, { color: service.color }]}>{service.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Payment Section */}
            <View style={styles.paymentSection}>
                <View style={styles.paymentHeader}>
                    <Text style={styles.paymentLabel}>HUYTICHXANH.COM</Text>
                    <Text style={styles.paymentTitle}>Thanh Toán Đa Nền Tảng</Text>
                    <Text style={styles.paymentDesc}>Bạn có thể nạp tiền mọi ngân hàng tại Việt Nam.</Text>
                </View>
                <View style={styles.bankGrid}>
                    {['BIDV', 'Vietcombank', 'Techcombank', 'MB', 'OCB', 'VPBank', 'VietinBank'].map((bank, index) => (
                        <View key={index} style={styles.bankCard}>
                            <Text style={styles.bankText}>{bank}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* CTA Section */}
            <LinearGradient
                colors={['#22d3ee', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaSection}
            >
                <Text style={styles.ctaTitle}>Bạn Đã Sẵn Sàng?</Text>
                <Text style={styles.ctaSubtitle}>Trải nghiệm ngay dịch vụ chất lượng cao</Text>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity style={styles.ctaButton}>
                        <Text style={styles.ctaButtonText}>Sử Dụng Ngay</Text>
                    </TouchableOpacity>
                </Link>
            </LinearGradient>
            
            <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // For status bar
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#EC4899',
  },
  navButtonText: {
    color: '#EC4899',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 44,
  },
  highlightText: {
    color: '#D946EF', // Pinkish purple
  },
  platformBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
    backgroundColor: '#FFF7ED',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  star: {
     fontSize: 12,
  },
  platformText: {
    color: '#F97316', // Orange
    fontWeight: '600',
    fontSize: 13,
  },
  heroButtons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderColor: '#EC4899',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#EC4899',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 14, // +2 for border compensation
    paddingHorizontal: 27,
    borderRadius: 12,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  benefitsSection: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FDF2F8', // Light pink bg
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A', // Dark blue
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsGrid: {
    gap: 15,
  },
  benefitCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  benefitIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#EFF6FF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5,
  },
  benefitDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  servicesSection: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  serviceName: {
    fontWeight: '700',
    fontSize: 14,
  },
  ctaSection: {
    margin: 20,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  ctaButtonText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 16,
  },
  paymentSection: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  paymentHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  paymentLabel: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  paymentDesc: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  bankCard: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 100,
    alignItems: 'center',
  },
  bankText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },
});
