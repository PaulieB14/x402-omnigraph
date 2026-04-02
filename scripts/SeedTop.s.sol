// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FacilitatorRegistry} from "../contracts/FacilitatorRegistry.sol";

/// @notice Seeds top facilitators — Coinbase (25), Thirdweb (10), PayAI (15), Heurist (9), Questflow (10)
contract SeedTop is Script {
    function run() external {
        FacilitatorRegistry registry = FacilitatorRegistry(0x67C75c4FD5BbbF5f6286A1874fe2d7dF0024Ebe8);

        vm.startBroadcast();

        // ── Coinbase CDP (25) ───────────────────────────────────────────────
        registry.addFacilitator(0xdbdf3d8ed80f84c35d01c6c9f9271761bad90ba6, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x9aae2b0d1b9dc55ac9bab9556f9a26cb64995fb9, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x3a70788150c7645a21b95b7062ab1784d3cc2104, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x708e57b6650a9a741ab39cae1969ea1d2d10eca1, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0xce82eeec8e98e443ec34fda3c3e999cbe4cb6ac2, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x7f6d822467df2a85f792d4508c5722ade96be056, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x001ddabba5782ee48842318bd9ff4008647c8d9c, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x9c09faa49c4235a09677159ff14f17498ac48738, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0xcbb10c30a9a72fae9232f41cbbd566a097b4e03a, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x9fb2714af0a84816f5c6322884f2907e33946b88, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x47d8b3c9717e976f31025089384f23900750a5f4, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x94701e1df9ae06642bf6027589b8e05dc7004813, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x552300992857834c0ad41c8e1a6934a5e4a2e4ca, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0xd7469bf02d221968ab9f0c8b9351f55f8668ac4f, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x88800e08e20b45c9b1f0480cf759b5bf2f05180c, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x6831508455a716f987782a1ab41e204856055cc2, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0xdc8fbad54bf5151405de488f45acd555517e0958, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x91d313853ad458addda56b35a7686e2f38ff3952, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0xadd5585c776b9b0ea77e9309c1299a40442d820f, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x4ffeffa616a1460570d1eb0390e264d45a199e91, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x8f5cb67b49555e614892b7233cfddebfb746e531, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x67b9ce703d9ce658d7c4ac3c289cea112fe662af, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x68a96f41ff1e9f2e7b591a931a4ad224e7c07863, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0x97acce27d5069544480bde0f04d9f47d7422a016, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");
        registry.addFacilitator(0xa32ccda98ba7529705a059bd2d213da8de10d101, "Coinbase", "https://api.cdp.coinbase.com/platform/v2/x402");

        // ── Thirdweb (10) ───────────────────────────────────────────────────
        registry.addFacilitator(0x80c08de1a05df2bd633cf520754e40fde3c794d3, "Thirdweb", "");
        registry.addFacilitator(0xaaca1ba9d2627cbc0739ba69890c30f95de046e4, "Thirdweb", "");
        registry.addFacilitator(0xa1822b21202a24669eaf9277723d180cd6dae874, "Thirdweb", "");
        registry.addFacilitator(0xec10243b54df1a71254f58873b389b7ecece89c2, "Thirdweb", "");
        registry.addFacilitator(0x052aaae3cad5c095850246f8ffb228354c56752a, "Thirdweb", "");
        registry.addFacilitator(0x91ddea05f741b34b63a7548338c90fc152c8631f, "Thirdweb", "");
        registry.addFacilitator(0xea52f2c6f6287f554f9b54c5417e1e431fe5710e, "Thirdweb", "");
        registry.addFacilitator(0x3a5ca1c6aa6576ae9c1c0e7fa2b4883346bc5aa0, "Thirdweb", "");
        registry.addFacilitator(0x7e20b62bf36554b704774afb0fcc0ae8f899213b, "Thirdweb", "");
        registry.addFacilitator(0xd88a9a58806b895ff06744082c6a20b9d7184b0f, "Thirdweb", "");

        // ── PayAI (15) ──────────────────────────────────────────────────────
        registry.addFacilitator(0xc6699d2aada6c36dfea5c248dd70f9cb0235cb63, "PayAI", "");
        registry.addFacilitator(0xb2bd29925cbbcea7628279c91945ca5b98bf371b, "PayAI", "");
        registry.addFacilitator(0x25659315106580ce2a787ceec5efb2d347b539c9, "PayAI", "");
        registry.addFacilitator(0xb8f41cb13b1f213da1e94e1b742ec1323235c48f, "PayAI", "");
        registry.addFacilitator(0xe575fa51af90957d66fab6d63355f1ed021b887b, "PayAI", "");
        registry.addFacilitator(0x03a3f7ce8e21e6f8d9fa14c67d8876b2470dc2f1, "PayAI", "");
        registry.addFacilitator(0x675707bc7d03089f820c1b7d49f7480083e8f4df, "PayAI", "");
        registry.addFacilitator(0xf46833d4ac4f0f1405cc05c30edfd86770f721c9, "PayAI", "");
        registry.addFacilitator(0x2daaef6f941de214bf7d6daf322bc6bc7406accb, "PayAI", "");
        registry.addFacilitator(0x2fae4026a31f19183947f0a6045ef975ebfa9ca8, "PayAI", "");
        registry.addFacilitator(0xe299c486066739c4a31609e1268d93229632dd47, "PayAI", "");
        registry.addFacilitator(0x6ccf245c883f9f3c6caee0687aa61daf7bc96e32, "PayAI", "");
        registry.addFacilitator(0xaf990eef9846b63d896056050fdc0b28bca9c24b, "PayAI", "");
        registry.addFacilitator(0x489c40fc3c2a19ad8cb275b7dd6aa194e9219c4f, "PayAI", "");
        registry.addFacilitator(0x9df61a719ddae27c20a63a417271cc2c704654bd, "PayAI", "");

        // ── Heurist (9) ─────────────────────────────────────────────────────
        registry.addFacilitator(0xb578b7db22581507d62bdbeb85e06acd1be09e11, "Heurist", "");
        registry.addFacilitator(0x021cc47adeca6673def958e324ca38023b80a5be, "Heurist", "");
        registry.addFacilitator(0x3f61093f61817b29d9556d3b092e67746af8cdfd, "Heurist", "");
        registry.addFacilitator(0x290d8b8edcafb25042725cb9e78bcac36b8865f8, "Heurist", "");
        registry.addFacilitator(0x612d72dc8402bba997c61aa82ce718ea23b2df5d, "Heurist", "");
        registry.addFacilitator(0x1fc230ee3c13d0d520d49360a967dbd1555c8326, "Heurist", "");
        registry.addFacilitator(0x48ab4b0af4ddc2f666a3fcc43666c793889787a3, "Heurist", "");
        registry.addFacilitator(0xd97c12726dcf994797c981d31cfb243d231189fb, "Heurist", "");
        registry.addFacilitator(0x90d5e567017f6c696f1916f4365dd79985fce50f, "Heurist", "");

        // ── Questflow (10) ──────────────────────────────────────────────────
        registry.addFacilitator(0x724efafb051f17ae824afcdf3c0368ae312da264, "Questflow", "");
        registry.addFacilitator(0xa9a54ef09fc8b86bc747cec6ef8d6e81c38c6180, "Questflow", "");
        registry.addFacilitator(0x4638bc811c93bf5e60deed32325e93505f681576, "Questflow", "");
        registry.addFacilitator(0xd7d91a42dfadd906c5b9ccde7226d28251e4cd0f, "Questflow", "");
        registry.addFacilitator(0x4544b535938b67d2a410a98a7e3b0f8f68921ca7, "Questflow", "");
        registry.addFacilitator(0x59e8014a3b884392fbb679fe461da07b18c1ff81, "Questflow", "");
        registry.addFacilitator(0xe6123e6b389751c5f7e9349f3d626b105c1fe618, "Questflow", "");
        registry.addFacilitator(0xf70e7cb30b132fab2a0a5e80d41861aa133ea21b, "Questflow", "");
        registry.addFacilitator(0x90da501fdbec74bb0549100967eb221fed79c99b, "Questflow", "");
        registry.addFacilitator(0xce7819f0b0b871733c933d1f486533bab95ec47b, "Questflow", "");

        // ── Smaller facilitators (14) ───────────────────────────────────────
        registry.addFacilitator(0x222c4367a2950f3b53af260e111fc3060b0983ff, "AurraCloud", "");
        registry.addFacilitator(0xb70c4fe126de09bd292fe3d1e40c6d264ca6a52a, "AurraCloud", "");
        registry.addFacilitator(0xd348e724e0ef36291a28dfeccf692399b0e179f8, "AurraCloud", "");
        registry.addFacilitator(0xd8dfc729cbd05381647eb5540d756f4f8ad63eec, "X402rs", "");
        registry.addFacilitator(0x76eee8f0acabd6b49f1cc4e9656a0c8892f3332e, "X402rs", "");
        registry.addFacilitator(0x06F0BfD2C8f36674DF5cdE852c1eeD8025C268C9, "Corbits", "");
        registry.addFacilitator(0x40272E2eAc848Ea70db07Fd657D799bD309329C4, "Dexter", "");
        registry.addFacilitator(0x279e08f711182c79Ba6d09669127a426228a4653, "Daydreams", "");
        registry.addFacilitator(0xfe0920a0a7f0f8a1ec689146c30c3bbef439bf8a, "Mogami", "");
        registry.addFacilitator(0x80735b3f7808e2e229ace880dbe85e80115631ca, "Virtuals Protocol", "");
        registry.addFacilitator(0x179761d9eed0f0d1599330cc94b0926e68ae87f1, "AnySpend", "");
        registry.addFacilitator(0x66c40946b0dffd04be467e18309857307ecd37cb, "Polymer", "");
        registry.addFacilitator(0x1892f72fdb3a966b2ad8595aa5f7741ef72d6085, "RelAI", "");
        registry.addFacilitator(0x15e2e2da7539ef1f652aa3c1d6142a535aa3d7ea, "Bitrefill", "");

        vm.stopBroadcast();
        console.log("Seeded 83 facilitator addresses");
    }
}
