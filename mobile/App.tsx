import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { authAPI, carrerasAPI, planesAPI, materiasAPI, areasAPI } from './src/services/api';

const Stack = createNativeStackNavigator();

// Colors
const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  background: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  danger: '#ef4444',
  success: '#22c55e',
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authAPI.currentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Dashboard" options={{ headerShown: false }}>
            {() => <DashboardScreen user={user} onLogout={() => { setUser(null); checkAuth(); }} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {() => <LoginScreen onLogin={(u) => { setUser(u); }} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // CSRF primero
      await authAPI.login(username, password);
      const userData = await authAPI.currentUser();
      onLogin(userData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>SIGeA</Text>
        <Text style={styles.subtitle}>Sistema Integral de Gestión Académica</Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DashboardScreen({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('carreras');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (type: string) => {
    setLoading(true);
    try {
      let response: any;
      switch (type) {
        case 'carreras':
          response = await carrerasAPI.getAll();
          break;
        case 'planes':
          response = await planesAPI.getAll();
          break;
        case 'materias':
          response = await materiasAPI.getAll();
          break;
        case 'areas':
          response = await areasAPI.getAll();
          break;
      }
      setData(response.results || response.data || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'carreras') {
      return (
        <View style={styles.item}>
          <Text style={styles.itemTitle}>{item.nombre}</Text>
          <Text style={styles.itemSubtitle}>{item.unidad_academica_sigla} - {item.codigo}</Text>
        </View>
      );
    }
    if (activeTab === 'planes') {
      return (
        <View style={styles.item}>
          <Text style={styles.itemTitle}>{item.nombre}</Text>
          <Text style={styles.itemSubtitle}>{item.carrera_nombre}</Text>
          <Text style={[styles.badge, item.es_vigente ? styles.badgeSuccess : styles.badgeWarning]}>
            {item.es_vigente ? 'Vigente' : 'No vigente'}
          </Text>
        </View>
      );
    }
    if (activeTab === 'materias') {
      return (
        <View style={styles.item}>
          <Text style={styles.itemTitle}>{item.nombre}</Text>
          <Text style={styles.itemSubtitle}>{item.codigo}</Text>
        </View>
      );
    }
    if (activeTab === 'areas') {
      return (
        <View style={styles.item}>
          <Text style={styles.itemTitle}>{item.nombre}</Text>
          <Text style={styles.itemSubtitle}>{item.plan_de_estudio_nombre}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SIGeA</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabs}>
        {['carreras', 'planes', 'materias', 'areas'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay datos</Text>}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 12,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  badge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  badgeWarning: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 40,
  },
});

export { COLORS };