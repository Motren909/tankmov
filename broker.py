import argparse
import serial
import time
import subprocess

'''
broker.py
broker messages from reader to car
'''
def callExe(args:list): # args format: [exepath, args to be passed to exe]
    print ('Executing {} with args {}'.format(args[0], args[1:]))
    try:
        subprocess.call(args) 
    except Exception as e:
        print('Execution Failed with {}'.format(e))

class CarCtlBroker:
    """Broker for car control messages
        deliver messages from reader->car
    """
    def __init__(self, readerPort, carPort):
        self.readerPort = readerPort
        self.carPort = carPort

        # constants

        self.MSG_SIZE = 1
    def __del__(self):
        if self.readerCom != None:
            self.readerCom.close()
        if self.carCom != None:
            self.carCom.close()
    def openPorts(self):
        print('readerPort: {}'.format(self.readerPort))
        self.readerCom = serial.Serial(self.readerPort)
        self.carCom = None
        # self.carCom = serial.Serial(self.carPort)
    def sendMsg(self,msg):
        carCom.write(msg)
    def getMsg(self):
        msg=[]
        if self.readerCom.inWaiting()>0:
            for i in range(self.MSG_SIZE):
                msg.append(self.readerCom.read()) # read one byte
            return True, msg
        else:
            return False, msg

    # utils  
    def parseMsg(self, msg):

        print('msg received: {}'.format(msg))
        # Parse Msg and take actions as per it.
        if(msg[0]=='t'):
            # send car stop cmd
            # self.carCom.write(msg[0])
            callExe(['../build/Tester/ReaderH7/R7_CarCtlTx.exe', '{}'.format(self.carPort)])
            pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('readerPort',help="tag Port")
    parser.add_argument('carPort',help="Car Control Port")
    args = parser.parse_args()
    broker = CarCtlBroker(args.readerPort, args.carPort)
    print('Try open ports...')
    
    try:
        broker.openPorts()
    except Exception as err:
        print(err)
    print('Ports opened! Waiting for Messages...')
    while True:
        try:
            flag, msg = broker.getMsg()
            if flag:
                broker.parseMsg(msg)
            time.sleep(0.01)
        except KeyboardInterrupt as e:
            print('Broker Stopped!')
            break

if __name__ == "__main__":
    main()