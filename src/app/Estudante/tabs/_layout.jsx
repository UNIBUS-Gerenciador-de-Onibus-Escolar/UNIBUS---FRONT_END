import { Tabs } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';


export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      
        tabBarStyle: {
          backgroundColor: '#FFD60A', 
          borderTopWidth: 0,
          height: 80,
        },
        tabBarActiveTintColor: '#000', 
        tabBarInactiveTintColor: '#000', 
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          
        },
      }}
    >
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="telaInicial"
        options={{
          title: 'Ônibus',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bus" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notificacoes"
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications-outline" size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
    
  );
  
}
