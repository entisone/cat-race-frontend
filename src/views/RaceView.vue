<template>
  <div class="container">
    <h1 class="title">🐱 Cat Race Arena</h1>
    <div class="actions">
      <button class="btn" @click="connectWallet">🔌 Connect Wallet</button>
      <div v-if="walletAddress" class="wallet">
        Connected: {{ walletAddress }}
      </div>
    </div>

    <div v-if="errorMessage" class="error">⚠️ {{ errorMessage }}</div>

    <div class="controls">
      <button class="btn primary" @click="joinRace">
        🎟 Join Race (0.01 ETH)
      </button>
      <button class="btn start" @click="startRace">🏁 Start Race</button>
    </div>

    <div class="race-track">
      <div
        v-for="(cat, index) in cats"
        :key="index"
        class="cat"
        :style="getCatStyle(index)"
      >
        🐱
      </div>
      <div class="finish-line">🏁</div>
    </div>

    <div class="race-info" v-if="cats.length">
      <h2>Participants</h2>
      <ul>
        <li v-for="(cat, index) in cats" :key="index">
          <strong>#{{ index + 1 }}</strong> – {{ cat.owner }} | Bet:
          {{ cat.bet }} | <span v-if="cat.isWinner">🏆 Winner</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getContract } from "../services/blockchain";
import { ethers } from "ethers";

export default defineComponent({
  setup() {
    const cats = ref<any[]>([]);
    const walletAddress = ref<string>("");
    const positions = ref<number[]>([]);
    const errorMessage = ref<string>("");

    const raceSound = new Audio("/race-start.mp3"); // Add race-start.mp3 to public folder

    const connectWallet = async () => {
      try {
        const provider = (window as any).phantom.ethereum;
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });
        walletAddress.value = accounts[0];
      } catch (e) {
        errorMessage.value = "Wallet connection failed";
      }
    };

    const fetchCats = async () => {
      const contract = await getContract();
      const result = await contract.getCats();
      cats.value = result;
      positions.value = Array(result.length).fill(0);
    };

    const joinRace = async () => {
      errorMessage.value = "";
      try {
        const contract = await getContract();
        await contract.enterRace({ value: ethers.parseEther("0.01") });
        fetchCats();
      } catch (err: any) {
        errorMessage.value =
          err.reason || "Failed to join race. Make sure you have enough ETH.";
      }
    };

    const startRace = async () => {
      errorMessage.value = "";
      try {
        const contract = await getContract();
        await contract.startRace();
        raceSound.play();
        animateRace();
        fetchCats();
      } catch (err: any) {
        errorMessage.value =
          err.reason ||
          "Race start failed. Only owner can start the race, and at least 2 cats must be in.";
      }
    };

    const animateRace = () => {
      const interval = setInterval(() => {
        positions.value = positions.value.map((p) => p + Math.random() * 5);
        if (positions.value.some((p) => p >= 90)) {
          clearInterval(interval);
        }
      }, 100);
    };

    const getCatStyle = (index: number) => {
      return {
        transform: `translateX(${positions.value[index]}%)`,
        transition: "transform 0.1s ease-out",
      };
    };

    onMounted(() => {
      fetchCats();
    });

    return {
      cats,
      joinRace,
      startRace,
      getCatStyle,
      walletAddress,
      connectWallet,
      errorMessage,
    };
  },
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  font-family: "Arial", sans-serif;
  padding: 20px;
  background-color: #fff5e6;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}
.title {
  font-size: 2.5rem;
  margin-bottom: 20px;
}
.actions,
.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.btn {
  background: #f8f8f8;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}
.btn:hover {
  background: #ffe0b3;
  border-color: #ff9900;
}
.btn.primary {
  background: #fff4cc;
  border-color: #ffcc00;
}
.btn.primary:hover {
  background: #ffeb99;
}
.btn.start {
  background: #d6f5d6;
  border-color: #66cc66;
}
.btn.start:hover {
  background: #b3e6b3;
}
.wallet {
  font-size: 0.9rem;
  color: #555;
  margin-top: 5px;
}
.error {
  color: #c00;
  background: #ffdede;
  border: 1px solid #c00;
  padding: 10px;
  margin: 10px auto;
  border-radius: 8px;
  width: fit-content;
}
.race-track {
  position: relative;
  height: 60px;
  background: #cceeff;
  border: 2px dashed #0077cc;
  overflow: hidden;
  margin-top: 20px;
  border-radius: 10px;
}
.cat {
  position: absolute;
  top: 10px;
  font-size: 2rem;
  transition: transform 0.1s linear;
}
.finish-line {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 10px;
  background: repeating-linear-gradient(
    45deg,
    #000,
    #000 5px,
    #fff 5px,
    #fff 10px
  );
}
.race-info {
  margin-top: 20px;
  text-align: left;
}
.race-info ul {
  list-style: none;
  padding: 0;
}
.race-info li {
  background: #f7f7f7;
  padding: 10px;
  margin: 5px 0;
  border-radius: 6px;
  font-size: 0.95rem;
  word-break: break-all;
}
</style>
