// src/orders.tsx
import { List, Datagrid, TextField, DateField, NumberField, ReferenceField, ShowButton } from 'react-admin';

export const OrderList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <DateField source="orderDate" showTime />
            <NumberField source="total" options={{ style: 'currency', currency: 'USD' }} />
            <TextField source="status" />
            <ShowButton />
        </Datagrid>
    </List>
);