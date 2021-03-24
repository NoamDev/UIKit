import * as React from 'react';
import { View } from 'react-native';

import { UIBottomBar } from '@tonlabs/uikit.navigation_legacy';
import {
    UIFeedback,
    UIPushFeedback,
    UIStubPage,
    UITokenCell,
} from '@tonlabs/uikit.legacy';
import { ExampleSection } from '../components/ExampleSection';
import { ExampleScreen } from '../components/ExampleScreen';

export const Products = () => (
    <ExampleScreen>
        <ExampleSection title="UIBottomBar">
            <View style={{ maxWidth: 500, height: 180, paddingVertical: 20 }}>
                <UIBottomBar
                    testID="uiBottomBar_info"
                    leftText="Feedback"
                    companyName="Wallet solutions OÜ"
                    address="Jõe 2"
                    postalCode="10151"
                    location="Tallinn, Estonia"
                    email="os@ton.space"
                    phoneNumber="+372 7124030"
                    copyRight="2018-2019 © TON Labs"
                />
            </View>
        </ExampleSection>
        <ExampleSection title="UIFeedback">
            <View style={{ maxWidth: 500, paddingVertical: 20 }}>
                <UIFeedback testID="uiFeedback_default" />
            </View>
        </ExampleSection>
        <ExampleSection title="UIPushFeedback">
            <View style={{ maxWidth: 500, paddingVertical: 20 }}>
                <UIPushFeedback testID="uiPushFeedback_message" onPress={() => undefined} />
            </View>
        </ExampleSection>
        <ExampleSection title="UIStubPage">
            <View style={{ maxWidth: 500, paddingVertical: 20 }}>
                <UIStubPage testID="uiStubPage_default" title="labs." needBottomIcon={false} />
            </View>
        </ExampleSection>
        <ExampleSection title="UITokenCell">
            <View style={{ width: 300, paddingVertical: 20 }}>
                <UITokenCell
                    testID="uiTokenCell_Gram"
                    title="GRAM"
                    details="balance"
                    balance="100.0000"
                />
            </View>
        </ExampleSection>
    </ExampleScreen>
);
